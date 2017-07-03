import EventEmitter from 'events';
import relative from 'require-relative';
import path from 'path';
import * as fs from 'fs';
import { sequence } from './utils/promise.js';

const opts = { encoding: 'utf-8', persistent: true };

let chokidar;

try {
	chokidar = relative( 'chokidar', process.cwd() );
} catch (err) {
	chokidar = null;
}

class FileWatcher {
	constructor ( file, data, callback, useChokidar, dispose ) {
		const handleWatchEvent = (event) => {
			if ( event === 'rename' || event === 'unlink' ) {
				this.fsWatcher.close();
				dispose();
				callback();
			} else {
				// this is necessary because we get duplicate events...
				const contents = fs.readFileSync( file, 'utf-8' );
				if ( contents !== data ) {
					data = contents;
					callback();
				}
			}
		};

		try {
			if (useChokidar)
				this.fsWatcher = chokidar.watch(file, { ignoreInitial: true }).on('all', handleWatchEvent);
			else
				this.fsWatcher = fs.watch( file, opts, handleWatchEvent);

			this.fileExists = true;
		} catch ( err ) {
			if ( err.code === 'ENOENT' ) {
				// can't watch files that don't exist (e.g. injected
				// by plugins somehow)
				this.fileExists = false;
			} else {
				throw err;
			}
		}
	}

	close () {
		this.fsWatcher.close();
	}
}

export default function watch ( rollup, options ) {
	const watchOptions = options.watch || {};
	const useChokidar = 'useChokidar' in watchOptions ? watchOptions.useChokidar : !!chokidar;

	if ( useChokidar && !chokidar ) {
		throw new Error( `options.watch.useChokidar is true, but chokidar could not be found. Have you installed it?` );
	}

	const watcher = new EventEmitter();

	const dests = options.dest ? [ path.resolve( options.dest ) ] : options.targets.map( target => path.resolve( target.dest ) );
	let filewatchers = new Map();

	let rebuildScheduled = false;
	let building = false;
	let watching = false;
	let closed = false;

	let timeout;
	let cache;

	function triggerRebuild () {
		clearTimeout( timeout );
		rebuildScheduled = true;

		timeout = setTimeout( () => {
			if ( !building ) build();
		}, 50 );
	}

	function addFileWatchersForModules ( modules ) {
		modules.forEach( module => {
			let id = module.id;

			// skip plugin helper modules
			if ( /\0/.test( id ) ) return;

			try {
				id = fs.realpathSync( id );
			} catch ( err ) {
				return;
			}

			if ( ~dests.indexOf( id ) ) {
				throw new Error( 'Cannot import the generated bundle' );
			}

			if ( !filewatchers.has( id ) ) {
				const watcher = new FileWatcher( id, module.originalCode, triggerRebuild, useChokidar, () => {
					filewatchers.delete( id );
				});

				if ( watcher.fileExists ) filewatchers.set( id, watcher );
			}
		});
	}

	function build () {
		if ( building || closed ) return;

		rebuildScheduled = false;

		let start = Date.now();
		let initial = !watching;
		if ( cache ) options.cache = cache;

		watcher.emit( 'event', { code: 'BUILD_START' });

		building = true;

		return rollup.rollup( options )
			.then( bundle => {
				// Save off bundle for re-use later
				cache = bundle;

				if ( !closed ) {
					addFileWatchersForModules(bundle.modules);
				}

				// Now we're watching
				watching = true;

				if ( options.targets ) {
					return sequence( options.targets, target => {
						const mergedOptions = Object.assign( {}, options, target );
						return bundle.write( mergedOptions );
					});
				}

				return bundle.write( options );
			})
			.then( () => {
				watcher.emit( 'event', {
					code: 'BUILD_END',
					duration: Date.now() - start,
					initial
				});
			}, error => {
				try {
					//If build failed, make sure we are still watching those files from the most recent successful build.
					addFileWatchersForModules( cache.modules );
				}
				catch (e) {
					//Ignore if they tried to import the output. We are already inside of a catch (probably caused by that).
				}
				watcher.emit( 'event', {
					code: 'ERROR',
					error
				});
			})
			.then( () => {
				building = false;
				if ( rebuildScheduled && !closed ) build();
			});
	}

	// build on next tick, so consumers can listen for BUILD_START
	process.nextTick( build );

	watcher.close = () => {
		for ( const fw of filewatchers.values() ) {
			fw.close();
		}
		closed = true;
	};

	return watcher;
}
