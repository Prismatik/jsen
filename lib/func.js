'use strict';

var util = require('util');

module.exports = function func() {
    var args = [].join.call(arguments, ', '),
        lines = '',
        vars = '',
        ind = 1,
        tab = '  ',
        bs = '{[',  // block start
        be = '}]',  // block end
        space = function () {
            return new Array(ind + 1).join(tab);
        },
        push = function (line) {
            lines += space() + line + '\n';
        },
        builder = function () {
            var line = arguments.length > 1 ? util.format.apply(util, arguments).trim() : arguments[0],
                first = line[0],
                last = line[line.length - 1];

            if (be.indexOf(first) > -1 && bs.indexOf(last) > -1) {
                ind--;
                push(line);
                ind++;
            }
            else if (bs.indexOf(last) > -1) {
                push(line);
                ind++;
            }
            else if (be.indexOf(first) > -1) {
                ind--;
                push(line);
            }
            else {
                push(line);
            }

            return builder;
        };

    builder.def = function (id, def) {
        if (def !== undefined && arguments.length > 2) {
            def = util.format.apply(util, [].slice.call(arguments, 1));
        }

        vars += space() + 'var ' + id + (def !== undefined ? ' = ' + def : '') + '\n';

        return builder;
    };

    builder.toSource = function () {
        return 'function (' + args + ') {\n' + vars + '\n' + lines + '\n}';
    };

    builder.vars = function () {
        return vars;
    };

    builder.lines = function () {
        return builder.vars() + '\n' + lines;
    };

    builder.compile = function (context) {
        var src = 'return (' + builder.toSource() + ')',
            ctx = context || {},
            keys = Object.keys(ctx),
            vals = keys.map(function (key) { return ctx[key]; });

        return Function.apply(null, keys.concat(src)).apply(null, vals);
    };

    return builder;
};