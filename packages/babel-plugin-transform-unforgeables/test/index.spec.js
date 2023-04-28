import * as babel from '@babel/core';
import * as swc from '@swc/wasm';

import unforgeablesExport from '../dist/index.mjs.js';

const unforgeablesPlugin =
    typeof unforgeablesExport === 'function'
        ? // When testing from the mono-repo root `unforgeablesExport` is a function.
          unforgeablesExport
        : // When testing from this package `unforgeablesExport` is the `exports` exports.
          unforgeablesExport.default;

function minifySync(inputCode, options) {
    return swc.transformSync(inputCode, {
        minify: true,
        jsc: {
            minify: {
                compress: {
                    unused: false,
                },
                mangle: true,
            },
        },
        ...options,
    });
}

function stripOutput(string) {
    return string.replace(/[\s();]/g, '');
}

function transformSync(inputCode, options) {
    return babel.transformSync(inputCode, {
        babelrc: false,
        configFile: false,
        ...options,
    });
}

describe('Babel transformation', () => {
    describe('Location transformations', () => {
        const allLocationPatternsOutput = `
            exports.allLocationPatterns = (el, value, frames, self, top, window) =>
                [
                    location,
                    location.assign(value),
                    location.assign(location.href + value),
                    location *= value,
                    (document.defaultView === globalThis || document.defaultView === document ? location : document.defaultView.location),
                    (document.defaultView === globalThis || document.defaultView === document ? location.assign(value) : document.defaultView.location = value),
                    (document.defaultView === globalThis || document.defaultView === document ? location.assign(location.href + value) : document.defaultView.location += value),
                    document.defaultView.location *= value,
                    (document.defaultView === globalThis || document.defaultView === document ? location : document.defaultView.location).href = value,
                    (document.defaultView === globalThis || document.defaultView === document ? location : document.defaultView.location).href += value,
                    (document.defaultView === globalThis || document.defaultView === document ? location : document.defaultView.location).href *= value,
                    ++document.defaultView.location,
                    document.defaultView.location++,
                    (frames === globalThis || frames === document ? location : frames.location),
                    (frames === globalThis || frames === document ? location.assign(value) : frames.location = value),
                    (frames === globalThis || frames === document ? location.assign(location.href + value) : frames.location += value),
                    frames.location *= value,
                    (frames === globalThis || frames === document ? location : frames.location).href = value,
                    (frames === globalThis || frames === document ? location : frames.location).href += value,
                    (frames === globalThis || frames === document ? location : frames.location).href *= value,
                    ++frames.location,
                    frames.location++,
                    (globalThis === globalThis || globalThis === document ? location : globalThis.location),
                    (globalThis === globalThis || globalThis === document ? location.assign(value) : globalThis.location = value),
                    (globalThis === globalThis || globalThis === document ? location.assign(location.href + value) : globalThis.location += value),
                    globalThis.location *= value,
                    (globalThis === globalThis || globalThis === document ? location : globalThis.location).href = value,
                    (globalThis === globalThis || globalThis === document ? location : globalThis.location).href += value,
                    (globalThis === globalThis || globalThis === document ? location : globalThis.location).href *= value,
                    ++globalThis.location,
                    globalThis.location++,
                    (self === globalThis || self === document ? location : self.location),
                    (self === globalThis || self === document ? location.assign(value) : self.location = value),
                    (self === globalThis || self === document ? location.assign(location.href + value) : self.location += value),
                    self.location *= value,
                    (self === globalThis || self === document ? location : self.location).href = value,
                    (self === globalThis || self === document ? location : self.location).href += value,
                    (self === globalThis || self === document ? location : self.location).href *= value,
                    ++self.location,
                    self.location++,
                    (top === globalThis || top === document ? location : top.location),
                    (top === globalThis || top === document ? location.assign(value) : top.location = value),
                    (top === globalThis || top === document ? location.assign(location.href + value) : top.location += value),
                    top.location *= value,
                    (top === globalThis || top === document ? location : top.location).href = value,
                    (top === globalThis || top === document ? location : top.location).href += value,
                    (top === globalThis || top === document ? location : top.location).href *= value,
                    ++top.location,
                    top.location++,
                    (window === globalThis || window === document ? location : window.location),
                    (window === globalThis || window === document ? location.assign(value) : window.location = value),
                    (window === globalThis || window === document ? location.assign(location.href + value) : window.location += value),
                    window.location *= value,
                    (window === globalThis || window === document ? location : window.location).href = value,
                    (window === globalThis || window === document ? location : window.location).href += value,
                    (window === globalThis || window === document ? location : window.location).href *= value,
                    ++window.location,
                    window.location++,
                    (document === globalThis || document === document ? location : document.location),
                    (document === globalThis || document === document ? location.assign(value) : document.location = value),
                    (document === globalThis || document === document ? location.assign(location.href + value) : document.location += value),
                    document.location *= value,
                    (document === globalThis || document === document ? location : document.location).href = value,
                    (document === globalThis || document === document ? location : document.location).href += value,
                    (document === globalThis || document === document ? location : document.location).href *= value,
                    ++document.location,
                    document.location++,
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location : el.ownerDocument.location),
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location.assign(location.href + value) : el.ownerDocument.location += value),
                    el.ownerDocument.location *= value,
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location : el.ownerDocument.location).href = value,
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location : el.ownerDocument.location).href += value,
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location : el.ownerDocument.location).href *= value,
                    ++el.ownerDocument.location,
                    el.ownerDocument.location++
                ];
        `;
        const looseLocationPatternsOutput = `
            var _document = document,
                _globalThis = globalThis,
                _location = location;
            exports.looseLocationPatterns = (el, value, frames, self, top, window) =>
                [
                    (document.defaultView === globalThis || document.defaultView === document ? _location : document.defaultView.location),
                    (document.defaultView === globalThis || document.defaultView === _document ? location.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis || document.defaultView === document ? location.assign(location.href + value) : document.defaultView.location += value)
                    (document.defaultView === globalThis || document.defaultView === document ? _location : document.defaultView.location).href = value,
                    (document.defaultView === globalThis || document.defaultView === _document ? location : document.defaultView.location).href += value,
                    (frames === _globalThis || frames === document ? location : frames.location),
                    (frames === globalThis || frames === document ? _location.assign(value) : frames.location = value),
                    (frames === globalThis || frames === _document ? location.assign(location.href + value) : frames.location += value),
                    (frames === _globalThis || frames === document ? location : frames.location).href = value,
                    (frames === globalThis || frames === document ? _location : frames.location).href += value,
                    (globalThis === globalThis || globalThis === _document ? location : globalThis.location),
                    (globalThis === _globalThis || globalThis === document ? location.assign(value) : globalThis.location = value),
                    (globalThis === globalThis || globalThis === document ? _location.assign(location.href + value) : globalThis.location += value),
                    (globalThis === globalThis || globalThis === _document ? location : globalThis.location).href = value,
                    (globalThis === _globalThis || globalThis === document ? location : globalThis.location).href += value,
                    (self === globalThis || self === document ? _location : self.location),
                    (self === globalThis || self === _document ? location.assign(value) : self.location = value),
                    (self === _globalThis || self === document ? location.assign(location.href + value) : self.location += value),
                    (self === globalThis || self === document ? _location : self.location).href = value,
                    (self === globalThis || self === _document ? location : self.location).href += value,
                    (top === _globalThis || top === document ? location : top.location),
                    (top === globalThis || top === document ? _location.assign(value) : top.location = value),
                    (top === globalThis || top === _document ? location.assign(location.href + value) : top.location += value),
                    (top === _globalThis || top === document ? location : top.location).href = value,
                    (top === globalThis || top === document ? _location : top.location).href += value,
                    (window === globalThis || window === _document ? location : window.location),
                    (window === _globalThis || window === document ? location.assign(value) : window.location = value),
                    (window === globalThis || window === document ? location.assign(_location.href + value) : window.location += value),
                    (window === globalThis || window === document ? _location : window.location).href = value,
                    (window === globalThis || window === _document ? location : window.location).href += value,
                    (document === _globalThis || document === document ? location : document.location),
                    (document === globalThis || document === document ? _location.assign(value) : document.location = value),
                    (document === globalThis || document === _document ? location.assign(location.href + value) : document.location += value),
                    (document === _globalThis || document === document ? location : document.location).href = value,
                    (document === globalThis || document === document ? _location : document.location).href += value,
                    (el.ownerDocument === globalThis || el.ownerDocument === _document ? location : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis || el.ownerDocument === document ? location.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? location.assign(_location.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === globalThis || el.ownerDocument === document ? _location : el.ownerDocument.location).href = value,
                    (el.ownerDocument === globalThis || el.ownerDocument === _document ? location : el.ownerDocument.location).href += value
                ];
        `;
        const shadowedLocationPatternsInput = `
            var noInit,
                noNode = 1,
                $noSort = location;
            exports.shadowedLocationPatterns = (el, value, document, globalThis, location) =>
                [
                    location,
                    location = value,
                    location += value,
                    document.defaultView.location,
                    (document.defaultView.location = value),
                    (document.defaultView.location += value),
                    (document.defaultView.location.href = value),
                    (document.defaultView.location.href += value),
                    frames.location,
                    (frames.location = value),
                    (frames.location += value),
                    (frames.location.href = value),
                    (frames.location.href += value),
                    globalThis.location,
                    (globalThis.location = value),
                    (globalThis.location += value),
                    (globalThis.location.href = value),
                    (globalThis.location.href += value),
                    self.location,
                    (self.location = value),
                    (self.location += value),
                    (self.location.href = value),
                    (self.location.href += value),
                    top.location,
                    (top.location = value),
                    (top.location += value),
                    (top.location.href = value),
                    (top.location.href += value),
                    window.location,
                    (window.location = value),
                    (window.location += value),
                    (window.location.href = value),
                    (window.location.href += value),
                    document.location,
                    (document.location = value),
                    (document.location += value),
                    (document.location.href = value),
                    (document.location.href += value),
                    el.ownerDocument.location,
                    (el.ownerDocument.location = value),
                    (el.ownerDocument.location += value),
                    (el.ownerDocument.location.href = value),
                    (el.ownerDocument.location.href += value),
                ];
        `;
        const shadowedLocationPatternsOutput = `
            var _document = document,
                _globalThis = globalThis,
                _location = location;
            var noInit,
                noNode = 1,
                $noSort = location;
            exports.shadowedLocationPatterns = (el, value, document, globalThis, location) =>
                [
                    location,
                    location = value,
                    location += value,
                    (document.defaultView === _globalThis || document.defaultView === _document ? _location : document.defaultView.location),
                    (document.defaultView === _globalThis || document.defaultView === _document ? _location.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis || document.defaultView === _document ? _location.assign(_location.href + value) : document.defaultView.location += value),
                    (document.defaultView === _globalThis || document.defaultView === _document ? _location : document.defaultView.location).href = value,
                    (document.defaultView === _globalThis || document.defaultView === _document ? _location : document.defaultView.location).href += value,
                    (frames === _globalThis || frames === _document ? _location : frames.location),
                    (frames === _globalThis || frames === _document ? _location.assign(value) : frames.location = value),
                    (frames === _globalThis || frames === _document ? _location.assign(_location.href + value) : frames.location += value),
                    (frames === _globalThis || frames === _document ? _location : frames.location).href = value,
                    (frames === _globalThis || frames === _document ? _location : frames.location).href += value,
                    (globalThis === _globalThis || globalThis === _document ? _location : globalThis.location),
                    (globalThis === _globalThis || globalThis === _document ? _location.assign(value) : globalThis.location = value),
                    (globalThis === _globalThis || globalThis === _document ? _location.assign(_location.href + value) : globalThis.location += value),
                    (globalThis === _globalThis || globalThis === _document ? _location : globalThis.location).href = value,
                    (globalThis === _globalThis || globalThis === _document ? _location : globalThis.location).href += value,
                    (self === _globalThis || self === _document ? _location : self.location),
                    (self === _globalThis || self === _document ? _location.assign(value) : self.location = value),
                    (self === _globalThis || self === _document ? _location.assign(_location.href + value) : self.location += value),
                    (self === _globalThis || self === _document ? _location : self.location).href = value,
                    (self === _globalThis || self === _document ? _location : self.location).href += value,
                    (top === _globalThis || top === _document ? _location : top.location),
                    (top === _globalThis || top === _document ? _location.assign(value) : top.location = value),
                    (top === _globalThis || top === _document ? _location.assign(_location.href + value) : top.location += value),
                    (top === _globalThis || top === _document ? _location : top.location).href = value,
                    (top === _globalThis || top === _document ? _location : top.location).href += value,
                    (window === _globalThis || window === _document ? _location : window.location),
                    (window === _globalThis || window === _document ? _location.assign(value) : window.location = value),
                    (window === _globalThis || window === _document ? _location.assign(_location.href + value) : window.location += value),
                    (window === _globalThis || window === _document ? _location : window.location).href = value,
                    (window === _globalThis || window === _document ? _location : window.location).href += value,
                    (document === _globalThis || document === _document ? _location : document.location),
                    (document === _globalThis || document === _document ? _location.assign(value) : document.location = value),
                    (document === _globalThis || document === _document ? _location.assign(_location.href + value) : document.location += value),
                    (document === _globalThis || document === _document ? _location : document.location).href = value,
                    (document === _globalThis || document === _document ? _location : document.location).href += value,
                    (el.ownerDocument === _globalThis || el.ownerDocument === _document ? _location : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis || el.ownerDocument === _document ? _location.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === _globalThis || el.ownerDocument === _document ? _location.assign(_location.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === _globalThis || el.ownerDocument === _document ? _location : el.ownerDocument.location).href = value,
                    (el.ownerDocument === _globalThis || el.ownerDocument === _document ? _location : el.ownerDocument.location).href += value
                ];
        `;
        const nestedShadowedLocationPatternsInput = `
            var noInit,
                noNode = 1,
                $noSort = location;
            exports.shadowedLocationPatterns = (el, value, document, globalThis, location) =>
                [
                    location,
                    location = value,
                    location += value,
                    document.defaultView.location,
                    (document.defaultView.location = value),
                    (document.defaultView.location += value),
                    (document.defaultView.location.href = value),
                    (document.defaultView.location.href += value),
                    frames.location,
                    (frames.location = value),
                    (frames.location += value),
                    (frames.location.href = value),
                    (frames.location.href += value),
                    globalThis.location,
                    (globalThis.location = value),
                    (globalThis.location += value),
                    (globalThis.location.href = value),
                    (globalThis.location.href += value),
                    self.location,
                    (self.location = value),
                    (self.location += value),
                    (self.location.href = value),
                    (self.location.href += value),
                    top.location,
                    (top.location = value),
                    (top.location += value),
                    (top.location.href = value),
                    (top.location.href += value),
                    window.location,
                    (window.location = value),
                    (window.location += value),
                    (window.location.href = value),
                    (window.location.href += value),
                    document.location,
                    (document.location = value),
                    (document.location += value),
                    (document.location.href = value),
                    (document.location.href += value),
                    el.ownerDocument.location,
                    (el.ownerDocument.location = value),
                    (el.ownerDocument.location += value),
                    (el.ownerDocument.location.href = value),
                    (el.ownerDocument.location.href += value),
                    function nestedShadowedLocationPatterns(el, value, _document, _globalThis, _location) {
                        return [
                            _location,
                            _location = value,
                            _location += value,
                            document.defaultView.location,
                            (document.defaultView.location = value),
                            (document.defaultView.location += value),
                            (document.defaultView.location.href = value),
                            (document.defaultView.location.href += value),
                            frames.location,
                            (frames.location = value),
                            (frames.location += value),
                            (frames.location.href = value),
                            (frames.location.href += value),
                            globalThis.location,
                            (globalThis.location = value),
                            (globalThis.location += value),
                            (globalThis.location.href = value),
                            (globalThis.location.href += value),
                            self.location,
                            (self.location = value),
                            (self.location += value),
                            (self.location.href = value),
                            (self.location.href += value),
                            top.location,
                            (top.location = value),
                            (top.location += value),
                            (top.location.href = value),
                            (top.location.href += value),
                            window.location,
                            (window.location = value),
                            (window.location += value),
                            (window.location.href = value),
                            (window.location.href += value),
                            document.location,
                            (document.location = value),
                            (document.location += value),
                            (document.location.href = value),
                            (document.location.href += value),
                            el.ownerDocument.location,
                            (el.ownerDocument.location = value),
                            (el.ownerDocument.location += value),
                            (el.ownerDocument.location.href = value),
                            (el.ownerDocument.location.href += value),
                        ];
                    },
                ];
        `;
        const nestedShadowedLocationPatternsOutput = `
            var _document2 = document,
                _globalThis2 = globalThis,
                _location2 = location;
            var noInit,
                noNode = 1,
                $noSort = location;
            exports.shadowedLocationPatterns = (el, value, document, globalThis, location) =>
                [
                    location,
                    location = value,
                    location += value,
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign( _location2.href + value) : document.defaultView.location += value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href = value,
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href += value,
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location),
                    (frames === _globalThis2 || frames === _document2 ?  _location2.assign(value) : frames.location = value),
                    (frames === _globalThis2 || frames === _document2 ?  _location2.assign( _location2.href + value) : frames.location += value),
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href = value,
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href += value,
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign(value) : globalThis.location = value),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign( _location2.href + value) : globalThis.location += value),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href = value,
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href += value,
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location),
                    (self === _globalThis2 || self === _document2 ?  _location2.assign(value) : self.location = value),
                    (self === _globalThis2 || self === _document2 ?  _location2.assign( _location2.href + value) : self.location += value),
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href = value,
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href += value,
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location),
                    (top === _globalThis2 || top === _document2 ?  _location2.assign(value) : top.location = value),
                    (top === _globalThis2 || top === _document2 ?  _location2.assign( _location2.href + value) : top.location += value),
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href = value,
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href += value,
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location),
                    (window === _globalThis2 || window === _document2 ?  _location2.assign(value) : window.location = value),
                    (window === _globalThis2 || window === _document2 ?  _location2.assign( _location2.href + value) : window.location += value),
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href = value,
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href += value,
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location),
                    (document === _globalThis2 || document === _document2 ?  _location2.assign(value) : document.location = value),
                    (document === _globalThis2 || document === _document2 ?  _location2.assign( _location2.href + value) : document.location += value),
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href = value,
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href += value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign( _location2.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href = value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href += value,
                    function nestedShadowedLocationPatterns(el, value, _document, _globalThis,  _location) {
                        return [
                            _location,
                            _location = value,
                            _location += value,
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign(value) : document.defaultView.location = value),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign( _location2.href + value) : document.defaultView.location += value),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href = value,
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href += value,
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location),
                            (frames === _globalThis2 || frames === _document2 ?  _location2.assign(value) : frames.location = value),
                            (frames === _globalThis2 || frames === _document2 ?  _location2.assign( _location2.href + value) : frames.location += value),
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href = value,
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href += value,
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign(value) : globalThis.location = value),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign( _location2.href + value) : globalThis.location += value),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href = value,
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href += value,
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location),
                            (self === _globalThis2 || self === _document2 ?  _location2.assign(value) : self.location = value),
                            (self === _globalThis2 || self === _document2 ?  _location2.assign( _location2.href + value) : self.location += value),
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href = value,
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href += value,
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location),
                            (top === _globalThis2 || top === _document2 ?  _location2.assign(value) : top.location = value),
                            (top === _globalThis2 || top === _document2 ?  _location2.assign( _location2.href + value) : top.location += value),
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href = value,
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href += value,
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location),
                            (window === _globalThis2 || window === _document2 ?  _location2.assign(value) : window.location = value),
                            (window === _globalThis2 || window === _document2 ?  _location2.assign( _location2.href + value) : window.location += value),
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href = value,
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href += value,
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location),
                            (document === _globalThis2 || document === _document2 ?  _location2.assign(value) : document.location = value),
                            (document === _globalThis2 || document === _document2 ?  _location2.assign( _location2.href + value) : document.location += value),
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href = value,
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href += value,
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign(value) : el.ownerDocument.location = value),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign( _location2.href + value) : el.ownerDocument.location += value),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href = value,
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href += value
                        ];
                    }
                ];
        `;
        const shadowedTopLevelLocationPatternsInput = `
            var document = 'no',
                globalThis = 'no',
                location = 'no',
                _document = document,
                _globalThis = globalThis,
                _location = location;
            exports.shadowedLocationPatterns = (el, value) =>
                [
                    document.defaultView.location,
                    (document.defaultView.location = value),
                    (document.defaultView.location += value),
                    (document.defaultView.location.href = value),
                    (document.defaultView.location.href += value),
                    frames.location,
                    (frames.location = value),
                    (frames.location += value),
                    (frames.location.href = value),
                    (frames.location.href += value),
                    globalThis.location,
                    (globalThis.location = value),
                    (globalThis.location += value),
                    (globalThis.location.href = value),
                    (globalThis.location.href += value),
                    self.location,
                    (self.location = value),
                    (self.location += value),
                    (self.location.href = value),
                    (self.location.href += value),
                    top.location,
                    (top.location = value),
                    (top.location += value),
                    (top.location.href = value),
                    (top.location.href += value),
                    window.location,
                    (window.location = value),
                    (window.location += value),
                    (window.location.href = value),
                    (window.location.href += value),
                    document.location,
                    (document.location = value),
                    (document.location += value),
                    (document.location.href = value),
                    (document.location.href += value),
                    el.ownerDocument.location,
                    (el.ownerDocument.location = value),
                    (el.ownerDocument.location += value),
                    (el.ownerDocument.location.href = value),
                    (el.ownerDocument.location.href += value),
                ];
        `;
        const shadowedTopLevelLocationPatternsOutput = `
            var _document2 = document,
                _globalThis2 = globalThis,
                _location2 = location;
            var document = 'no',
                globalThis = 'no',
                location = 'no',
                _document = document,
                _globalThis = globalThis,
                _location = location;
            exports.shadowedLocationPatterns = (el, value) =>
                [
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2.assign(_location2.href + value) : document.defaultView.location += value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location).href = value,
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location).href += value,
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location),
                    (frames === _globalThis2 || frames === _document2 ? _location2.assign(value) : frames.location = value),
                    (frames === _globalThis2 || frames === _document2 ? _location2.assign(_location2.href + value) : frames.location += value),
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location).href = value,
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location).href += value,
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2.assign(value) : globalThis.location = value),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2.assign(_location2.href + value) : globalThis.location += value),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location).href = value,
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location).href += value,
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location),
                    (self === _globalThis2 || self === _document2 ? _location2.assign(value) : self.location = value),
                    (self === _globalThis2 || self === _document2 ? _location2.assign(_location2.href + value) : self.location += value),
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location).href = value,
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location).href += value,
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location),
                    (top === _globalThis2 || top === _document2 ? _location2.assign(value) : top.location = value),
                    (top === _globalThis2 || top === _document2 ? _location2.assign(_location2.href + value) : top.location += value),
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location).href = value,
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location).href += value,
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location),
                    (window === _globalThis2 || window === _document2 ? _location2.assign(value) : window.location = value),
                    (window === _globalThis2 || window === _document2 ? _location2.assign(_location2.href + value) : window.location += value),
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location).href = value,
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location).href += value,
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location),
                    (document === _globalThis2 || document === _document2 ? _location2.assign(value) : document.location = value),
                    (document === _globalThis2 || document === _document2 ? _location2.assign(_location2.href + value) : document.location += value),
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location).href = value,
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location).href += value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2.assign(_location2.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location).href = value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location).href += value
                ];
        `;

        it('matches all location patterns', () => {
            const allLocationPatternsInput = `
                exports.allLocationPatterns = (el, value, frames, self, top, window) =>
                    [
                        location,
                        location = value,
                        location += value,
                        location *= value,
                        document.defaultView.location,
                        (document.defaultView.location = value),
                        (document.defaultView.location += value),
                        (document.defaultView.location *= value),
                        (document.defaultView.location.href = value),
                        (document.defaultView.location.href += value),
                        (document.defaultView.location.href *= value),
                        ++document.defaultView.location,
                        document.defaultView.location++,
                        frames.location,
                        (frames.location = value),
                        (frames.location += value),
                        (frames.location *= value),
                        (frames.location.href = value),
                        (frames.location.href += value),
                        (frames.location.href *= value),
                        ++frames.location,
                        frames.location++,
                        globalThis.location,
                        (globalThis.location = value),
                        (globalThis.location += value),
                        (globalThis.location *= value),
                        (globalThis.location.href = value),
                        (globalThis.location.href += value),
                        (globalThis.location.href *= value),
                        ++globalThis.location,
                        globalThis.location++,
                        self.location,
                        (self.location = value),
                        (self.location += value),
                        (self.location *= value),
                        (self.location.href = value),
                        (self.location.href += value),
                        (self.location.href *= value),
                        ++self.location,
                        self.location++,
                        top.location,
                        (top.location = value),
                        (top.location += value),
                        (top.location *= value),
                        (top.location.href = value),
                        (top.location.href += value),
                        (top.location.href *= value),
                        ++top.location,
                        top.location++,
                        window.location,
                        (window.location = value),
                        (window.location += value),
                        (window.location *= value),
                        (window.location.href = value),
                        (window.location.href += value),
                        (window.location.href *= value),
                        ++window.location,
                        window.location++,
                        document.location,
                        (document.location = value),
                        (document.location += value),
                        (document.location *= value),
                        (document.location.href = value),
                        (document.location.href += value),
                        (document.location.href *= value),
                        ++document.location,
                        document.location++,
                        el.ownerDocument.location,
                        (el.ownerDocument.location = value),
                        (el.ownerDocument.location += value),
                        (el.ownerDocument.location *= value),
                        (el.ownerDocument.location.href = value),
                        (el.ownerDocument.location.href += value),
                        (el.ownerDocument.location.href *= value),
                        ++el.ownerDocument.location,
                        el.ownerDocument.location++,
                    ];
            `;
            const transformed = transformSync(allLocationPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(allLocationPatternsOutput));
        });

        it('matches window.location assignment', () => {
            const inputCode = `
                function windowLocationAssignment() {
                    window.location = 'foo';
                }
            `;
            const expectedOutput = `
                function windowLocationAssignment() {
                    (window === globalThis || window === document ? location.assign('foo') : window.location = 'foo');
                }
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });

        it('matches window.location reassignment', () => {
            const inputCode = `
                let loc;
                function windowLocationReassignment() {
                    loc = window.location = 'foo';
                }
            `;
            const expectedOutput = `
                let loc;
                function windowLocationReassignment() {
                    loc = (window === globalThis || window === document ? location.assign('foo') : window.location = 'foo');
                }
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });

        it('skips destructured local location bindings', () => {
            const inputCode = `
                function updateUrlFromState(state) {
                    const { location, details } = state;
                    if (details.foo) {
                        location.href = '...';
                    }
                    window.location = location.href;
                }
            `;
            const expectedOutput = `
                var _location = location;
                function updateUrlFromState(state) {
                    const {
                        location,
                        details
                    } = state;
                    if (details.foo) {
                        location.href = '...';
                    }
                    (window === globalThis || window === document ? _location.assign(location.href) : window.location = location.href);
                }
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });

        it('renames shadowed globals', () => {
            const transformed = transformSync(shadowedLocationPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(shadowedLocationPatternsOutput));
        });

        it('renames shadowed top-level globals', () => {
            const transformed = transformSync(shadowedTopLevelLocationPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelLocationPatternsOutput)
            );
        });

        it('renames nested shadowed globals', () => {
            const transformed = transformSync(nestedShadowedLocationPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedLocationPatternsOutput)
            );
        });

        it("renames shadowed globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${shadowedLocationPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${shadowedLocationPatternsOutput}
                `)
            );
        });

        it("renames shadowed top-level globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${shadowedTopLevelLocationPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${shadowedTopLevelLocationPatternsOutput}
                `)
            );
        });

        it("renames nested shadowed globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${nestedShadowedLocationPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${nestedShadowedLocationPatternsOutput}
                `)
            );
        });

        it('does not re-transform patterns', () => {
            const transformed = transformSync(allLocationPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(allLocationPatternsOutput));
        });

        it('does not re-transform loose patterns', () => {
            const transformed = transformSync(looseLocationPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(looseLocationPatternsOutput));
        });

        it('does not re-transform shadowed patterns', () => {
            const transformed = transformSync(shadowedLocationPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(shadowedLocationPatternsOutput));
        });

        it('does not re-transform shadowed top-level patterns', () => {
            const transformed = transformSync(shadowedTopLevelLocationPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelLocationPatternsOutput)
            );
        });

        it('does not re-transform nested shadowed patterns', () => {
            const transformed = transformSync(nestedShadowedLocationPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedLocationPatternsOutput)
            );
        });

        it('does not re-transform minified patterns', () => {
            const { code: minified } = minifySync(allLocationPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified loose patterns', () => {
            const { code: minified } = minifySync(looseLocationPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified shadowed patterns', () => {
            const { code: minified } = minifySync(shadowedLocationPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified nested shadowed patterns', () => {
            const { code: minified } = minifySync(nestedShadowedLocationPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('transform member expression pattern misses', () => {
            const inputCode = `
                exports.patternMisses = () =>
                    [
                        miss || NODE.location,
                        (NODE === globalThis || NODE === document) ? miss : NODE.location,
                        (NODE === globalThis || miss) ? location : NODE.location,
                        (NODE === globalThis || NODE === miss) ? location : NODE.location,
                        (NODE === globalThis || NODE !== document) ? location : NODE.location,
                        (NODE === globalThis || miss === document) ? location : NODE.location,
                        (NODE === globalThis || 'miss' === document) ? location : NODE.location,
                        (NODE === globalThis ?? NODE === document) ? location : NODE.location,
                        (miss || NODE === document) ? location : NODE.location,
                        (NODE === miss || NODE === document) ? location : NODE.location,
                        (NODE === 'miss' || NODE === document) ? location : NODE.location,
                        (NODE !== globalThis || NODE === document) ? location : NODE.location,
                        (miss === globalThis || NODE === document) ? location : NODE.location,
                        ('miss' === globalThis || NODE === document) ? location : NODE.location,
                    ];
            `;
            const expectedOutput = `
                exports.patternMisses = () =>
                    [
                        miss || (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || NODE === document ? miss : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || miss ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || NODE === miss ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || NODE !== document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || miss === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis || 'miss' === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === globalThis ?? NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        miss || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === miss || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE === 'miss' || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        NODE !== globalThis || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        miss === globalThis || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location),
                        'miss' === globalThis || NODE === document ? location : (NODE === globalThis || NODE === document ? location : NODE.location)
                    ];
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });

        it('transform assignment expression with equal operator pattern misses', () => {
            const inputCode = `
                exports.patternMisses = () =>
                    [
                        miss || (NODE.location = VALUE),
                        (NODE === globalThis || NODE === document) ? location.assign(VALUE) : NODE.location = miss,
                        (NODE === globalThis || NODE === document) ? location.assign(VALUE) : NODE.location = 'miss',
                        (NODE === globalThis || NODE === document) ? miss : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(miss) : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign('miss') : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(VALUE, miss) : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? location.miss(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? miss.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || NODE === document) ? miss(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || miss) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || NODE === miss) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || NODE !== document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || miss === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis || 'miss' === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === globalThis ?? NODE === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (miss || NODE === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE === miss || NODE === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (NODE !== globalThis || NODE === document) ? location.assign(VALUE) : NODE.location = VALUE,
                        (miss === globalThis || NODE !== document) ? location.assign(VALUE) : NODE.location = VALUE,
                        ('miss' === globalThis || NODE !== document) ? location.assign(VALUE) : NODE.location = VALUE
                    ];
            `;
            const expectedOutput = `
                exports.patternMisses = () =>
                    [
                        miss || (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(miss) : NODE.location = miss),
                        NODE === globalThis || NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign('miss') : NODE.location = 'miss'),
                        NODE === globalThis || NODE === document ? miss : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.assign(miss) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.assign('miss') : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.assign(VALUE, miss) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.miss(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? miss.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? miss(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || miss ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === miss ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE !== document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || miss === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || 'miss' === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis ?? NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        miss || NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === miss || NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE !== globalThis || NODE === document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        miss === globalThis || NODE !== document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        'miss' === globalThis || NODE !== document ? location.assign(VALUE) : (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE)
                    ];
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });

        it('transform assignment expression with plus equal operator pattern misses', () => {
            const inputCode = `
                exports.patternMisses = () =>
                    [
                        miss || (NODE.location = VALUE),
                        (NODE === globalThis || NODE === document) ? location.assign(location.href + VALUE) : NODE.location += miss,
                        (NODE === globalThis || NODE === document) ? location.assign(location.href + VALUE) : NODE.location += 'miss',
                        (NODE === globalThis || NODE === document) ? miss : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(location.href + miss) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(location.href + 'miss') : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(location.href - VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(location.miss + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(miss.location + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(miss + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(miss) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.assign(location.href + VALUE, miss) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? location.miss(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? miss.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === document) ? miss(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || miss) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE === miss) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || NODE !== document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || miss === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis || 'miss' === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === globalThis ?? NODE === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (miss || NODE === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE === miss || NODE === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (NODE !== globalThis || NODE === document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        (miss === globalThis || NODE !== document) ? location.assign(location.href + VALUE) : NODE.location += VALUE,
                        ('miss' === globalThis || NODE !== document) ? location.assign(location.href + VALUE) : NODE.location += VALUE
                    ];
            `;
            const expectedOutput = `
                exports.patternMisses = () =>
                    [
                        miss || (NODE === globalThis || NODE === document ? location.assign(VALUE) : NODE.location = VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + miss) : NODE.location += miss),
                        NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + 'miss') : NODE.location += 'miss'),
                        NODE === globalThis || NODE === document ? miss : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.href + miss) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.href + 'miss') : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.href - VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.miss + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign((miss === globalThis || miss === document ? location : miss.location) + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(miss + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(miss) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.assign(location.href + VALUE, miss) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? location.miss(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? miss.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === document ? miss(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || miss ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE === miss ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || NODE !== document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || miss === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis || 'miss' === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === globalThis ?? NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        miss || NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE === miss || NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        NODE !== globalThis || NODE === document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        miss === globalThis || NODE !== document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE),
                        'miss' === globalThis || NODE !== document ? location.assign(location.href + VALUE) : (NODE === globalThis || NODE === document ? location.assign(location.href + VALUE) : NODE.location += VALUE)
                    ];
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });
    });

    describe('Top transformations', () => {
        const allTopPatternsOutput = `
            exports.allTopPatterns = (value, document, frames, parent, self, window) =>
                [
                    (window === globalThis ? top : window.top),
                    window.top = value,
                    window.top += value,
                    window.top *= value,
                    ++window.top,
                    window.top++,
                    (document.defaultView === globalThis ? top : document.defaultView.top),
                    document.defaultView.top = value,
                    document.defaultView.top += value,
                    document.defaultView.top *= value,
                    ++document.defaultView.top,
                    document.defaultView.top++,
                    (frames === globalThis ? top : frames.top),
                    frames.top = value,
                    frames.top += value,
                    frames.top *= value,
                    ++frames.top,
                    frames.top++,
                    (globalThis === globalThis ? top : globalThis.top),
                    globalThis.top = value,
                    globalThis.top += value,
                    globalThis.top *= value,
                    ++globalThis.top,
                    globalThis.top++,
                    (parent === globalThis ? top : parent.top),
                    parent.top = value,
                    parent.top += value,
                    parent.top *= value,
                    ++parent.top,
                    parent.top++,
                    (self === globalThis ? top : self.top),
                    self.top = value,
                    self.top += value,
                    self.top *= value,
                    ++self.top,
                    self.top++,
                    (top === globalThis ? top : top.top),
                    top.top = value,
                    top.top += value,
                    top.top *= value,
                    ++top.top,
                    top.top++
                ];
        `;
        const looseTopPatternsOutput = `
            var _globalThis = globalThis,
                _top = top;
            exports.looseTopPatterns = (document, frames, parent, self, window) =>
                [
                    (window === globalThis ? _top : window.top),
                    (document.defaultView === _globalThis ? top : document.defaultView.top),
                    (frames === globalThis ? _top : frames.top),
                    (globalThis === _globalThis ? top : globalThis.top),
                    (parent === globalThis ? _top : parent.top),
                    (self === _globalThis ? top : self.top),
                    (top === globalThis ? _top : top.top)
                ];
        `;
        const shadowedTopPatternsInput = `
            var noInit,
                noNode = 1,
                $noSort = top;
            exports.shadowedTopPatterns = (globalThis, top) =>
                [
                    window.top,
                    document.defaultView.top,
                    frames.top,
                    globalThis.top,
                    parent.top,
                    self.top,
                    top.top,
                ];
        `;
        const shadowedTopPatternsOutput = `
            var _globalThis = globalThis,
                _top = top;
            var noInit,
                noNode = 1,
                $noSort = top;
            exports.shadowedTopPatterns = (globalThis, top) =>
                [
                    (window === _globalThis ? _top : window.top),
                    (document.defaultView === _globalThis ? _top : document.defaultView.top),
                    (frames === _globalThis ? _top : frames.top),
                    (globalThis === _globalThis ? _top : globalThis.top),
                    (parent === _globalThis ? _top : parent.top),
                    (self === _globalThis ? _top : self.top),
                    (top === _globalThis ? _top : top.top)
                ];
        `;
        const shadowedTopLevelTopPatternsInput = `
            var globalThis = 'no',
                top = 'no',
                _globalThis = globalThis,
                _top = top;
            exports.shadowedTopLevelTopPatterns = () =>
                [
                    window.top,
                    document.defaultView.top,
                    frames.top,
                    globalThis.top,
                    parent.top,
                    self.top,
                    top.top,
                ];
        `;
        const shadowedTopLevelTopPatternsOutput = `
            var _globalThis2 = globalThis,
                _top2 = top;
            var globalThis = 'no',
                top = 'no',
                _globalThis = globalThis,
                _top = top;
            exports.shadowedTopLevelTopPatterns = () =>
                [
                    (window === _globalThis2 ? _top2 : window.top),
                    (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                    (frames === _globalThis2 ? _top2 : frames.top),
                    (globalThis === _globalThis2 ? _top2 : globalThis.top),
                    (parent === _globalThis2 ? _top2 : parent.top),
                    (self === _globalThis2 ? _top2 : self.top),
                    (top === _globalThis2 ? _top2 : top.top)
                ];
        `;

        const nestedShadowedTopPatternsInput = `
            var noInit,
                noNode = 1,
                $noSort = top;
            exports.shadowedTopPatterns = (globalThis, top) =>
                [
                    window.top,
                    document.defaultView.top,
                    frames.top,
                    globalThis.top,
                    parent.top,
                    self.top,
                    top.top,
                    function nestedShadowedTopPatterns(_globalThis, _top) {
                        return [
                            window.top,
                            document.defaultView.top,
                            frames.top,
                            globalThis.top,
                            parent.top,
                            self.top,
                            top.top,
                        ];
                    },
                ];
        `;
        const nestedShadowedTopPatternsOutput = `
            var _globalThis2 = globalThis,
                _top2 = top;
            var noInit,
                noNode = 1,
                $noSort = top;
            exports.shadowedTopPatterns = (globalThis, top) =>
                [
                    (window === _globalThis2 ? _top2 : window.top),
                    (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                    (frames === _globalThis2 ? _top2 : frames.top),
                    (globalThis === _globalThis2 ? _top2 : globalThis.top),
                    (parent === _globalThis2 ? _top2 : parent.top),
                    (self === _globalThis2 ? _top2 : self.top),
                    (top === _globalThis2 ? _top2 : top.top),
                    function nestedShadowedTopPatterns(_globalThis, _top) {
                        return [
                            (window === _globalThis2 ? _top2 : window.top),
                            (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                            (frames === _globalThis2 ? _top2 : frames.top),
                            (globalThis === _globalThis2 ? _top2 : globalThis.top),
                            (parent === _globalThis2 ? _top2 : parent.top),
                            (self === _globalThis2 ? _top2 : self.top),
                            (top === _globalThis2 ? _top2 : top.top)
                        ];
                    }
                ];
        `;

        it('matches all the top patterns', () => {
            const allTopPatternsInput = `
                exports.allTopPatterns = (value, document, frames, parent, self, window) =>
                    [
                        window.top,
                        (window.top = value),
                        (window.top += value),
                        (window.top *= value),
                        ++window.top,
                        window.top++,
                        document.defaultView.top,
                        (document.defaultView.top = value),
                        (document.defaultView.top += value),
                        (document.defaultView.top *= value),
                        ++document.defaultView.top,
                        document.defaultView.top++,
                        frames.top,
                        (frames.top = value),
                        (frames.top += value),
                        (frames.top *= value),
                        ++frames.top,
                        frames.top++,
                        globalThis.top,
                        (globalThis.top = value),
                        (globalThis.top += value),
                        (globalThis.top *= value),
                        ++globalThis.top,
                        globalThis.top++,
                        parent.top,
                        (parent.top = value),
                        (parent.top += value),
                        (parent.top *= value),
                        ++parent.top,
                        parent.top++,
                        self.top,
                        (self.top = value),
                        (self.top += value),
                        (self.top *= value),
                        ++self.top,
                        self.top++,
                        top.top,
                        (top.top = value),
                        (top.top += value),
                        (top.top *= value),
                        ++top.top,
                        top.top++,
                    ];
            `;
            const transformed = transformSync(allTopPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(allTopPatternsOutput));
        });

        it('renames shadowed globals', () => {
            const transformed = transformSync(shadowedTopPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(shadowedTopPatternsOutput));
        });

        it('renames shadowed top-level globals', () => {
            const transformed = transformSync(shadowedTopLevelTopPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelTopPatternsOutput)
            );
        });

        it('renames nested shadowed globals', () => {
            const transformed = transformSync(nestedShadowedTopPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedTopPatternsOutput)
            );
        });

        it("renames shadowed globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${shadowedTopPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${shadowedTopPatternsOutput}
                `)
            );
        });

        it("renames shadowed top-level globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${shadowedTopLevelTopPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${shadowedTopLevelTopPatternsOutput}
                `)
            );
        });

        it("renames nested shadowed globals with 'use strict' directive", () => {
            const transformed = transformSync(
                `
                    "use strict";
                    ${nestedShadowedTopPatternsInput}
                `,
                {
                    plugins: [unforgeablesPlugin()],
                }
            );
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(`
                    "use strict";
                    ${nestedShadowedTopPatternsOutput}
                `)
            );
        });

        it('does not re-transform patterns', () => {
            const transformed = transformSync(allTopPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(allTopPatternsOutput));
        });

        it('does not re-transform loose patterns', () => {
            const transformed = transformSync(looseTopPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(looseTopPatternsOutput));
        });

        it('does not re-transform shadowed patterns', () => {
            const transformed = transformSync(shadowedTopPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(shadowedTopPatternsOutput));
        });

        it('does not re-transform shadowed top-level patterns', () => {
            const transformed = transformSync(shadowedTopLevelTopPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelTopPatternsOutput)
            );
        });

        it('does not re-transform nested shadowed patterns', () => {
            const transformed = transformSync(nestedShadowedTopPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedTopPatternsOutput)
            );
        });

        it('does not re-transform minified patterns', () => {
            const { code: minified } = minifySync(allTopPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified loose patterns', () => {
            const { code: minified } = minifySync(looseTopPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified shadowed patterns', () => {
            const { code: minified } = minifySync(shadowedTopPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('does not re-transform minified nested shadowed patterns', () => {
            const { code: minified } = minifySync(nestedShadowedTopPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });

        it('transform member expression pattern misses', () => {
            const inputCode = `
                exports.patternMisses = () =>
                    [
                        miss || NODE.top,
                        NODE === globalThis ? miss : NODE.top,
                        miss ? top : NODE.top,
                        NODE === miss ? top : NODE.top,
                        NODE !== globalThis ? top : NODE.top,
                        miss === globalThis ? top : NODE.top,
                        'miss' === globalThis ? top : NODE.top,
                    ];
            `;
            const expectedOutput = `
                exports.patternMisses = () =>
                    [
                        miss || NODE === globalThis ? top : NODE.top,
                        NODE === globalThis ? miss : NODE === globalThis ? top : NODE.top,
                        miss ? top : NODE === globalThis ? top : NODE.top,
                        NODE === miss ? top : NODE === globalThis ? top : NODE.top,
                        NODE !== globalThis ? top : NODE === globalThis ? top : NODE.top,
                        miss === globalThis ? top : NODE === globalThis ? top : NODE.top,
                        'miss' === globalThis ? top : NODE === globalThis ? top : NODE.top
                    ];
            `;
            const transformed = transformSync(inputCode, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(expectedOutput));
        });
    });

    describe('Combined Location and Top transformations', () => {
        const shadowedTopLevelCombinedPatternsInput = `
            var document = 'no',
                globalThis = 'no',
                location = 'no',
                top = 'no',
                _document = document,
                _globalThis = globalThis,
                _location = location,
                _top = top;
            exports.shadowedLocationPatterns = (el, value) =>
                [
                    document.defaultView.location,
                    (document.defaultView.location = value),
                    (document.defaultView.location += value),
                    (document.defaultView.location.href = value),
                    (document.defaultView.location.href += value),
                    frames.location,
                    (frames.location = value),
                    (frames.location += value),
                    (frames.location.href = value),
                    (frames.location.href += value),
                    globalThis.location,
                    (globalThis.location = value),
                    (globalThis.location += value),
                    (globalThis.location.href = value),
                    (globalThis.location.href += value),
                    self.location,
                    (self.location = value),
                    (self.location += value),
                    (self.location.href = value),
                    (self.location.href += value),
                    top.location,
                    (top.location = value),
                    (top.location += value),
                    (top.location.href = value),
                    (top.location.href += value),
                    window.location,
                    (window.location = value),
                    (window.location += value),
                    (window.location.href = value),
                    (window.location.href += value),
                    document.location,
                    (document.location = value),
                    (document.location += value),
                    (document.location.href = value),
                    (document.location.href += value),
                    el.ownerDocument.location,
                    (el.ownerDocument.location = value),
                    (el.ownerDocument.location += value),
                    (el.ownerDocument.location.href = value),
                    (el.ownerDocument.location.href += value),
                    window.top,
                    document.defaultView.top,
                    frames.top,
                    globalThis.top,
                    parent.top,
                    self.top,
                    top.top,
                ];
        `;
        const shadowedTopLevelCombinedPatternsOutput = `
            var _document2 = document,
                _globalThis2 = globalThis,
                _location2 = location,
                _top2 = top;
            var document = 'no',
                globalThis = 'no',
                location = 'no',
                top = 'no',
                _document = document,
                _globalThis = globalThis,
                _location = location,
                _top = top;
            exports.shadowedLocationPatterns = (el, value) =>
                [
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2.assign(_location2.href + value) : document.defaultView.location += value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location).href = value,
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ? _location2 : document.defaultView.location).href += value,
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location),
                    (frames === _globalThis2 || frames === _document2 ? _location2.assign(value) : frames.location = value),
                    (frames === _globalThis2 || frames === _document2 ? _location2.assign(_location2.href + value) : frames.location += value),
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location).href = value,
                    (frames === _globalThis2 || frames === _document2 ? _location2 : frames.location).href += value,
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2.assign(value) : globalThis.location = value),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2.assign(_location2.href + value) : globalThis.location += value),
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location).href = value,
                    (globalThis === _globalThis2 || globalThis === _document2 ? _location2 : globalThis.location).href += value,
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location),
                    (self === _globalThis2 || self === _document2 ? _location2.assign(value) : self.location = value),
                    (self === _globalThis2 || self === _document2 ? _location2.assign(_location2.href + value) : self.location += value),
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location).href = value,
                    (self === _globalThis2 || self === _document2 ? _location2 : self.location).href += value,
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location),
                    (top === _globalThis2 || top === _document2 ? _location2.assign(value) : top.location = value),
                    (top === _globalThis2 || top === _document2 ? _location2.assign(_location2.href + value) : top.location += value),
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location).href = value,
                    (top === _globalThis2 || top === _document2 ? _location2 : top.location).href += value,
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location),
                    (window === _globalThis2 || window === _document2 ? _location2.assign(value) : window.location = value),
                    (window === _globalThis2 || window === _document2 ? _location2.assign(_location2.href + value) : window.location += value),
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location).href = value,
                    (window === _globalThis2 || window === _document2 ? _location2 : window.location).href += value,
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location),
                    (document === _globalThis2 || document === _document2 ? _location2.assign(value) : document.location = value),
                    (document === _globalThis2 || document === _document2 ? _location2.assign(_location2.href + value) : document.location += value),
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location).href = value,
                    (document === _globalThis2 || document === _document2 ? _location2 : document.location).href += value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2.assign(_location2.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location).href = value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ? _location2 : el.ownerDocument.location).href += value,
                    (window === _globalThis2 ? _top2 : window.top),
                    (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                    (frames === _globalThis2 ? _top2 : frames.top),
                    (globalThis === _globalThis2 ? _top2 : globalThis.top),
                    (parent === _globalThis2 ? _top2 : parent.top),
                    (self === _globalThis2 ? _top2 : self.top),
                    (top === _globalThis2 ? _top2 : top.top)
                ];
        `;
        const nestedShadowedCombinedPatternsInput = `
            var noInit,
                noNode = 1,
                $noSort = location,
                $d = top;
            function shadowedCombinedPatterns(el, value, document, globalThis, location, top) {
                return [
                    document.defaultView.location,
                    (document.defaultView.location = value),
                    (document.defaultView.location += value),
                    (document.defaultView.location.href = value),
                    (document.defaultView.location.href += value),
                    frames.location,
                    (frames.location = value),
                    (frames.location += value),
                    (frames.location.href = value),
                    (frames.location.href += value),
                    globalThis.location,
                    (globalThis.location = value),
                    (globalThis.location += value),
                    (globalThis.location.href = value),
                    (globalThis.location.href += value),
                    self.location,
                    (self.location = value),
                    (self.location += value),
                    (self.location.href = value),
                    (self.location.href += value),
                    top.location,
                    (top.location = value),
                    (top.location += value),
                    (top.location.href = value),
                    (top.location.href += value),
                    window.location,
                    (window.location = value),
                    (window.location += value),
                    (window.location.href = value),
                    (window.location.href += value),
                    document.location,
                    (document.location = value),
                    (document.location += value),
                    (document.location.href = value),
                    (document.location.href += value),
                    el.ownerDocument.location,
                    (el.ownerDocument.location = value),
                    (el.ownerDocument.location += value),
                    (el.ownerDocument.location.href = value),
                    (el.ownerDocument.location.href += value),
                    window.top,
                    document.defaultView.top,
                    frames.top,
                    globalThis.top,
                    parent.top,
                    self.top,
                    top.top,
                    function nestedShadowedCombinedPatterns(el, value, _document, _globalThis, _location, _top) {
                        return [
                            document.defaultView.location,
                            (document.defaultView.location = value),
                            (document.defaultView.location += value),
                            (document.defaultView.location.href = value),
                            (document.defaultView.location.href += value),
                            frames.location,
                            (frames.location = value),
                            (frames.location += value),
                            (frames.location.href = value),
                            (frames.location.href += value),
                            globalThis.location,
                            (globalThis.location = value),
                            (globalThis.location += value),
                            (globalThis.location.href = value),
                            (globalThis.location.href += value),
                            self.location,
                            (self.location = value),
                            (self.location += value),
                            (self.location.href = value),
                            (self.location.href += value),
                            top.location,
                            (top.location = value),
                            (top.location += value),
                            (top.location.href = value),
                            (top.location.href += value),
                            window.location,
                            (window.location = value),
                            (window.location += value),
                            (window.location.href = value),
                            (window.location.href += value),
                            document.location,
                            (document.location = value),
                            (document.location += value),
                            (document.location.href = value),
                            (document.location.href += value),
                            el.ownerDocument.location,
                            (el.ownerDocument.location = value),
                            (el.ownerDocument.location += value),
                            (el.ownerDocument.location.href = value),
                            (el.ownerDocument.location.href += value),
                            window.top,
                            document.defaultView.top,
                            frames.top,
                            globalThis.top,
                            parent.top,
                            self.top,
                            top.top,
                        ];
                    },
                ];
            }
        `;
        const nestedShadowedCombinedPatternsOutput = `
            var _document2 = document,
                _globalThis2 = globalThis,
                _location2 = location,
                _top2 = top;
            var noInit,
                noNode = 1,
                $noSort = location,
                $d = top;
            function shadowedCombinedPatterns(el, value, document, globalThis, location, top) {
                return [
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign(value) : document.defaultView.location = value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign( _location2.href + value) : document.defaultView.location += value),
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href = value,
                    (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href += value,
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location),
                    (frames === _globalThis2 || frames === _document2 ?  _location2.assign(value) : frames.location = value),
                    (frames === _globalThis2 || frames === _document2 ?  _location2.assign( _location2.href + value) : frames.location += value),
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href = value,
                    (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href += value,
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign(value) : globalThis.location = value),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign( _location2.href + value) : globalThis.location += value),
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href = value,
                    (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href += value,
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location),
                    (self === _globalThis2 || self === _document2 ?  _location2.assign(value) : self.location = value),
                    (self === _globalThis2 || self === _document2 ?  _location2.assign( _location2.href + value) : self.location += value),
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href = value,
                    (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href += value,
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location),
                    (top === _globalThis2 || top === _document2 ?  _location2.assign(value) : top.location = value),
                    (top === _globalThis2 || top === _document2 ?  _location2.assign( _location2.href + value) : top.location += value),
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href = value,
                    (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href += value,
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location),
                    (window === _globalThis2 || window === _document2 ?  _location2.assign(value) : window.location = value),
                    (window === _globalThis2 || window === _document2 ?  _location2.assign( _location2.href + value) : window.location += value),
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href = value,
                    (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href += value,
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location),
                    (document === _globalThis2 || document === _document2 ?  _location2.assign(value) : document.location = value),
                    (document === _globalThis2 || document === _document2 ?  _location2.assign( _location2.href + value) : document.location += value),
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href = value,
                    (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href += value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign(value) : el.ownerDocument.location = value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign( _location2.href + value) : el.ownerDocument.location += value),
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href = value,
                    (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href += value,
                    (window === _globalThis2 ? _top2 : window.top),
                    (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                    (frames === _globalThis2 ? _top2 : frames.top),
                    (globalThis === _globalThis2 ? _top2 : globalThis.top),
                    (parent === _globalThis2 ? _top2 : parent.top),
                    (self === _globalThis2 ? _top2 : self.top),
                    (top === _globalThis2 ? _top2 : top.top),
                    function nestedShadowedCombinedPatterns(el, value, _document, _globalThis,  _location, _top) {
                        return [
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign(value) : document.defaultView.location = value),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2.assign( _location2.href + value) : document.defaultView.location += value),
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href = value,
                            (document.defaultView === _globalThis2 || document.defaultView === _document2 ?  _location2 : document.defaultView.location).href += value,
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location),
                            (frames === _globalThis2 || frames === _document2 ?  _location2.assign(value) : frames.location = value),
                            (frames === _globalThis2 || frames === _document2 ?  _location2.assign( _location2.href + value) : frames.location += value),
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href = value,
                            (frames === _globalThis2 || frames === _document2 ?  _location2 : frames.location).href += value,
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign(value) : globalThis.location = value),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2.assign( _location2.href + value) : globalThis.location += value),
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href = value,
                            (globalThis === _globalThis2 || globalThis === _document2 ?  _location2 : globalThis.location).href += value,
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location),
                            (self === _globalThis2 || self === _document2 ?  _location2.assign(value) : self.location = value),
                            (self === _globalThis2 || self === _document2 ?  _location2.assign( _location2.href + value) : self.location += value),
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href = value,
                            (self === _globalThis2 || self === _document2 ?  _location2 : self.location).href += value,
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location),
                            (top === _globalThis2 || top === _document2 ?  _location2.assign(value) : top.location = value),
                            (top === _globalThis2 || top === _document2 ?  _location2.assign( _location2.href + value) : top.location += value),
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href = value,
                            (top === _globalThis2 || top === _document2 ?  _location2 : top.location).href += value,
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location),
                            (window === _globalThis2 || window === _document2 ?  _location2.assign(value) : window.location = value),
                            (window === _globalThis2 || window === _document2 ?  _location2.assign( _location2.href + value) : window.location += value),
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href = value,
                            (window === _globalThis2 || window === _document2 ?  _location2 : window.location).href += value,
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location),
                            (document === _globalThis2 || document === _document2 ?  _location2.assign(value) : document.location = value),
                            (document === _globalThis2 || document === _document2 ?  _location2.assign( _location2.href + value) : document.location += value),
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href = value,
                            (document === _globalThis2 || document === _document2 ?  _location2 : document.location).href += value,
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign(value) : el.ownerDocument.location = value),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2.assign( _location2.href + value) : el.ownerDocument.location += value),
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href = value,
                            (el.ownerDocument === _globalThis2 || el.ownerDocument === _document2 ?  _location2 : el.ownerDocument.location).href += value,
                            (window === _globalThis2 ? _top2 : window.top),
                            (document.defaultView === _globalThis2 ? _top2 : document.defaultView.top),
                            (frames === _globalThis2 ? _top2 : frames.top),
                            (globalThis === _globalThis2 ? _top2 : globalThis.top),
                            (parent === _globalThis2 ? _top2 : parent.top),
                            (self === _globalThis2 ? _top2 : self.top),
                            (top === _globalThis2 ? _top2 : top.top)
                        ];
                    }
                ];
            }
        `;

        it('renames shadowed top-level globals', () => {
            const transformed = transformSync(shadowedTopLevelCombinedPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelCombinedPatternsOutput)
            );
        });

        it('renames nested shadowed globals', () => {
            const transformed = transformSync(nestedShadowedCombinedPatternsInput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedCombinedPatternsOutput)
            );
        });

        it('does not re-transform shadowed top-level patterns', () => {
            const transformed = transformSync(shadowedTopLevelCombinedPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(shadowedTopLevelCombinedPatternsOutput)
            );
        });

        it('does not re-transform nested shadowed patterns', () => {
            const transformed = transformSync(nestedShadowedCombinedPatternsOutput, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(
                stripOutput(nestedShadowedCombinedPatternsOutput)
            );
        });

        it('does not re-transform minified nested shadowed patterns', () => {
            const { code: minified } = minifySync(nestedShadowedCombinedPatternsOutput);
            const transformed = transformSync(minified, {
                plugins: [unforgeablesPlugin()],
            });
            expect(stripOutput(transformed.code)).toBe(stripOutput(minified));
        });
    });
});
