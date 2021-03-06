'use strict';

function Command()
{
    // red-cursor command
    var cd    = /^ *cd *(~|\/|\.|\.\.|\w+)?\/? *;?$/;
    var ls    = /^ *(ls|dir) *;?$/;
    var clear = /^ *clear *;?$/;
    var echo  = /^ *(echo *|echo .*?);?$/;
    var df    = /^ *df *;?$/;
    var pwd   = /^ *pwd *;?$/;
    var cat   = /^ *cat *([a-zA-Z0-9._-]+|&gt; *[a-zA-Z0-9_.-]+)? *;?$/;
    var history   = /^ *history *;?$/;

    var bc = /^ *bc *(#[a-fA-F0-9]{3,6})? *;?$/;
    var fs = /^ *fs *([1-9][0-9])? *;?$/;

    var date = /^ *date *;?$/;
    var help = /^ *help *;?$/;

    var open = /^ *open *([^ ]+)? *;?$/;

    // badges command
    var badge = /^ *badge  *([1-9]|10)(\.\.(?:[1-9]|10))?  *(["'])((?:(?!\3).)*:(?:(?!\3).)*)\3 *(?:(default|#[0-9a-f]{3,6}):(default|#[0-9a-f]{3,6}))? *;?/i;
    // 0 = all
    // 1 = 1-20
    // 2 = ..1-20 or undefined
    // 3 = ' or "
    // 4 = "prefix:suffix"
    // 5 = default or prefix-color
    // 6 = default or suffix-color

    // line command
    var line = /^ *line *([1-5]) *(\d+) *(?:(default|#[0-9a-f]{3,6}))? *;?/i;
    // 0 = all
    // 1 = style
    // 2 = length
    // 3 = color

    // button command
    var button = /button  *(["'])((?:(?!\1).)*)\1 *(?:(none|default|#[0-9a-f]{3,6}))? *;?/i;
    // 0 = all
    // 1 = " or '
    // 2 = text
    // 3 = color | default | none

    // badge-font-size
    var bfs   = /^ *bfs *([5-9]|[1-9][0-9])? *;?$/;

    // print height, width and font-size
    var hwf   = /^ *hwf *;?$/;

    // shows an input to copy from for old browsers
    var shc   = /^ *shc *;?$/;

    // badges-theme
    // G => git-hub,
    // S => stack-overflow
    // T => twitter
    // F => face-book
    var theme    = /^ *theme *(G|S|T|F) *;?$/;

    // set the text-fill for button and path
    var TF    = /^ *TF(?:=(default|#[0-9a-fA-F]{3,6})) *;?$/;

    // path-stroke (color for stroke)
    var BS    = /^ *BS(?:=(none|default|#[0-9a-fA-F]{3,6})) *;?$/;

    // delimiter
    var DLM    = /^ *DLM(?:=([0-9]|[1-9][0-9])) *;?$/;

    // button-base-width 5-99
    var BCL    = /^ *BCL(?:=([5-9]|[1-9][0-9])) *;?$/;

    // path-stroke-width for button
    var BSW    = /^ *BSW(?:=([0-9])) *;?$/;

    var active_clipboard = false;

    // handle two key-press for Alter key
    // var twice_alt_flag = false;

    // storing each command as history
    this.histories = [];
    this.h_index   = 0;

    var line_buffer_backup = '';

    // store the xxx.exec( command ) result
    var exec_result = null;

    // check if a command is valid or NOT
    this.check = function( command )
    {
        if( ( exec_result = cd.exec( command ) ) )
        {
            // var arg = cd.exec( command )[ 1 ];
            this.cd( exec_result[ 1 ] );
        }
        else
        if( ls.exec( command ) )
        {
            this.ls();
        }
        else
        if( clear.exec( command ) )
        {
            this.clear();
        }
        else
        if( echo.exec( command ) )
        {
            var string = command.replace( /\s+/g, ' ' )
                                .replace( '$PATH', path.PATH );
            text( string.substr( 5, string.length ) + ' ' );
            screen.newline();
        }
        else
        if( df.exec( command ) )
        {
            this.df();
        }
        else
        if( pwd.exec( command ) )
        {
            text( path.pwd.join( '/' ) );
            screen.newline();
        }
        else
        if( ( exec_result = cat.exec( command ) ) )
        {
            // var arg = cat.exec( command )[ 1 ];
            this.cat( exec_result[ 1 ] );
        }
        else
        if( history.exec( command ) )
        {
            this.history();
        }
        else
        if( ( exec_result = bc.exec( command ) ) )
        {
            var color = exec_result[ 1 ];
            if( color === undefined  )
            {
                screen.background();
                text( 'reset to default' );
                screen.newline();
            }
            else
            {
                screen.background( color );
            }
        }
        else
        if( ( exec_result = fs.exec( command ) ) )
        {
            var size = exec_result[ 1 ];
            if( size === undefined )
            {
                screen.font_size();
                print( [
                    'reset to default: 15px',
                    'range is from 10 to 99.',
                ] );
            }
            else
            {
                screen.font_size( size );
            }
        }
        else
        if( date.exec( command ) )
        {
            text( Date() );
            screen.newline();
        }
        else
        if( help.exec( command ) )
        {
            this.help();
        }
        else
        if( ( exec_result = open.exec( command ) ) )
        {
            var media = exec_result[ 1 ];
            if( media === undefined  )
            {
                text( 'argument required be a media type' );
                screen.newline();
            }
            else
            {
                var cwd = path.cwd();
                if( media in path.root[ cwd ] && path.root[ cwd ][ media ] === 'media' )
                {;
                    window.open( './' + cwd + '/' + media, '_blank', path.readable[ cwd ][ media ] );
                }
                else
                {
                    text( '(' + media + ')' + ' is not media type' );
                    screen.newline();
                }
            }
        }
        else
        if( ( exec_result = badge.exec( command ) ) )
        {
            // var array = badge.exec( command );

            exec_result[ 5 ] = ( exec_result[ 5 ] === undefined ? badges.colors[ 0 ] : exec_result[ 5 ] );
            exec_result[ 6 ] = ( exec_result[ 6 ] === undefined ? badges.colors[ 1 ] : exec_result[ 6 ] );

            badges.colors[ 0 ] = ( exec_result[ 5 ] === 'default' ? '#434343' : exec_result[ 5 ] );
            badges.colors[ 1 ] = ( exec_result[ 6 ] === 'default' ? '#CB0000' : exec_result[ 6 ] );

            var begin = parseInt( exec_result[ 1 ] );
            if( exec_result[ 2 ] !== undefined )
            {
                var end   = parseInt( exec_result[ 2 ].substr( 2, 2 ) );
            }

            var ps = exec_result[ 4 ].split( ':' );
            print( [
                'style : ' + begin + ' to ' + end,
                'prefix: "' + ps[ 0 ] + '" color: ' + exec_result[ 5 ],
                'suffix: "' + ps.slice( 1, ps.length ) + '" color: ' + exec_result[ 6 ],
            ] );

            // for 1..10
            if( end > begin )
            {
                while( begin <= end )
                {
                    exec_result[ 1 ] = begin;
                    text( begin + ' => ' )
                    badges.create( exec_result );
                    ++begin;
                }
            }
            // for 10..1
            else
            if( end < begin )
            {
                while( begin >= end )
                {
                    exec_result[ 1 ] = begin;
                    text( begin + ' => ' )
                    badges.create( exec_result );
                    --begin;
                }
            }
            else
            {
                // create SVG and add it to div.display
                badges.create( exec_result );
            }

            var display = doc.class( 'display' );
            clipboard.value = '';

            if( end === undefined )
            {
                var temp = display[ display.length - 1 ].innerHTML
                clipboard.value = temp;
                temp = temp.replace( />/, ">\n" )
                           .replace( /<\/([a-z]+)>/gi, "</$1>\n" );

                if( enable_svg_log === true )
                {
                    console.log( temp );
                }

                text( 'char-height/max-width : ' + badges.char_height + '/' + badges.max_width + '(px)' );
                screen.newline();
                clipboard.select();
                if( document.execCommand("Copy") === true )
                {
                    text( 'copy style [' + begin + '] to clipboard was successful' );
                }
                else
                {
                    text( 'copy style [' + begin + '] to clipboard was unsuccessful' );
                }
            }
            else
            {
                text( 'nothing was copied to your clipboard.' );
            }

            screen.newline();
        }
        else // print help for badge command
        if( command.search( /^ *badge/ ) === 0 )
        {
            print( [
                'badge [style] [prefix:suffix] [default|#prefix-color:default|#suffix-color]',
                'style is between 1 to 20',
                'prefix and suffix should be surrounded using single-quote or double-quote',
                'prefix-color and suffix color are optional',
                'example: badge 1 "one:one"',
                "example: badge 1 'one:one'",
                'NOTE that colon ":" is the delimiter and necessary',
                'for more example: cd doc/ then cat how-to-use or just hit alt-h',
            ]);
        }
        else // run line command
            if( ( exec_result = line.exec( command ) ) )
        {
            // var exec_result = line.exec( command );

            exec_result[ 3 ] = ( exec_result[ 3 ] === undefined ? lines.color : exec_result[ 3 ] );

            lines.color = ( exec_result[ 3 ] === 'default' ? '#CB0000' : exec_result[ 3 ] );

            print( [
                'style : ' + exec_result[ 1 ],
                'length: ' + exec_result[ 2 ],
                'color : ' + lines.color
            ] );

            // create SVG-line and add it to div.display
            lines.create( exec_result );

            var display = doc.class( 'display' );
            clipboard.value = '';

            var temp = display[ display.length - 1 ].innerHTML
            clipboard.value = temp;
            temp = temp.replace( />/, ">\n" )
                .replace( /<\/([a-z]+)>/gi, "</$1>\n" );

            if( enable_svg_log === true )
            {
                console.log( temp );
            }

            text( 'char-height/max-width : ' + lines.char_height + '/' + lines.max_width + '(px)' );
            screen.newline();

            clipboard.select();
            if( document.execCommand("Copy") === true )
            {
                text( 'copy style [' + exec_result[ 1 ] + '] to clipboard was successful' );
            }
            else
            {
                text( 'copy style [' + exec_result[ 1 ] + '] to clipboard was unsuccessful' );
            }

            screen.newline();
        }
        else // print help for line command
        if( command.search( /^ *line/ ) === 0 )
        {
            print( [
                'line [style] [length] [default|#color]',
                'style is between 1 to 5',
                'color is optional. the default value: "#CB0000"',
                'example: line 1 100',
                'example: line 5 100 #0F0',
            ]);
        }
        else // button command
            if( ( exec_result = button.exec( command ) ) )
        {
            // we need the index 2, and 3
            // var exec_result = button.exec( command );
            var temp = {
                undefined : buttons.fill,
                'default' : '#434343',
                'none'    : 'none',
            };

            buttons.fill = temp[ exec_result[ 3 ] ];
            // when there is hex-color, temp returns 'undefined' to buttons.fill will be undefined
            if(  buttons.fill === undefined )
            {
                buttons.fill = exec_result[ 3 ];
            }

            print( [
                'text/fill   : ' + exec_result[ 2 ].match( /^(?:[()<>])?(.*?)(?:[()<>])?$/ )[ 1 ] + '/' + buttons.text_fill ,
                'button-fill : ' + buttons.fill,
            ]);

            // create a button and add it to div.display, exec_result[ 2 ] is the "text"
            buttons.create( exec_result[ 2 ] );

            var display = doc.class( 'display' );
            clipboard.value = '';

            var temp = display[ display.length - 1 ].innerHTML
            clipboard.value = temp;
            temp = temp.replace( />/, ">\n" )
                .replace( /<\/([a-z]+)>/gi, "</$1>\n" );

            if( enable_svg_log === true )
            {
                console.log( temp );
            }

            text( 'button-height/button-width : ' + buttons.button_height + '/' + buttons.button_width + '(px)' );
            screen.newline();

            clipboard.select();
            if( document.execCommand("Copy") === true )
            {
                text( 'copy style [' + buttons.style + '] to clipboard was successful' );
            }
            else
            {
                text( 'copy style [' + buttons.style + '] to clipboard was unsuccessful' );
            }
            screen.newline();
        }
        else // print help for button command
        if( command.search( /^ *button */ ) === 0 )
        {
            print( [
                'button "text" [default|#background-color]',
                'color is optional; default value: "#434334"',
                'example: button "home"',
                'example: button "home" #0F0',
            ]);
        }
        else // badge-font-size (for both badge and button)
            if( ( exec_result = bfs.exec( command ) ) )
        {
            var size = exec_result[ 1 ];
            if( size === undefined )
            {
                doc.id( 'badge-font-size' ).style.fontSize  = '15px';
                print( [
                    'reset to default: 15px',
                    'range is from 5 to 99.'
                ] );
            }
            else
            {
                print( [
                    'set (badge/button/line) font-size to: ' + size + 'px',
                    'run the command without argument to reset it.'
                ] );
                doc.id( 'badge-font-size' ).style.fontSize  = ( size + 'px' );
            }

            // update hwf: height, width and font-size
            badges.init();
            buttons.init();
            lines.init();
        }
        else // print a help for bfs command
        if( command.search( /^ *bfs/ ) === 0 )
        {
            print( [
                'wrong number, range is from 5 to 99',
                'for resetting to default use it without argument',
            ] );
        }
        else
        if( hwf.exec( command ) )
        {
            print( [
                'char-height: ' + badges.char_height,
                'char-width : ' + badges.char_width,
                'font-size  : ' + badges.font_size,
            ] );
        }
        else // toggle input.clipboard
        if( shc.exec( command ) )
        {
            if( active_clipboard === false )
            {
                clipboard.style.top = '10px';
                active_clipboard = true;
            }
            else
            {
                clipboard.style.top = '-100px';
                active_clipboard = false;
            }
        }
        else // badge-text-color
        if( TF.exec( command ) )
        {
            badges.text_color = TF.exec( command )[ 1 ];
            buttons.text_fill = badges.text_color;

            badges.text_color = badges.text_color === 'default' ? '#FFF' : badges.text_color;
            buttons.text_fill = buttons.text_fill === 'default' ? '#FFF' : buttons.text_fill;

            text( 'set text-color to ' + badges.text_color );
            screen.newline();
        }
        else // badge-text-color help
        if( command.search( /^ *TF/ ) === 0 )
        {
            print( [
                'TF ' + badges.text_color,
                'add a hex color and change the default',
                'or reset it: TF=default',
            ] );
        }
        else // badge delimiter for separation
            if( ( exec_result = DLM.exec( command ) ) )
        {
            badges.delimiter = parseInt( exec_result[ 1 ] );
            lines.delimiter = badges.delimiter;

            print( [
                'set delimiter to ' + badges.delimiter,
                'you can reset it using DLM=0'
            ] );
        }
        else // print help for DLM
        if( command.search( /^ *DLM/ ) === 0 )
        {
            print( [
                'DLM ' + badges.delimiter,
                'A number between 1 to 99',
                'default is 0',
            ] );
        }
        else // button-max-width
            if( (exec_result = BCL.exec( command ) ) )
        {
            buttons.char_length = parseInt( exec_result[ 1 ] );

            print( [
                'set button-char-length to ' + buttons.char_length,
                'you can reset it using BCL=10'
            ] );
        }
        else // print help for BCL
        if( command.search( /^ *BCL/ ) === 0 )
        {
            print( [
                'BCL ' + buttons.char_length,
                'A number between 5 to 99',
                'default is 10',
            ] );
        }
        else // button-stroke-width
            if( ( exec_result = BSW.exec( command ) ) )
        {
            buttons.stroke_width = parseInt( exec_result[ 1 ] )
            print( [
                'set button-stroke-width to ' + buttons.stroke_width,
                'you can reset it using BSW=10'
            ] );
        }
        else // print help for stroke-width
        if( command.search( /^ *BSW/ ) === 0 )
        {
            print( [
                'BSW ' + buttons.stroke_width,
                'A number between 0 to 9',
                'default is 0.',
            ] );
        }
        else // button path-stroke
            if( ( exec_result = BS.exec( command ) ) )
        {
            buttons.stroke = exec_result[ 1 ];
            buttons.stroke = buttons.stroke === 'default' ? '#434343' : buttons.stroke;

            text( 'set button-stroke to ' + buttons.stroke );
            screen.newline();
        }
        else // badge-text-color help
        if( command.search( /^ *BS/ ) === 0 )
        {
            print( [
                'BS ' + buttons.stroke,
                'add a hex color and change the default',
                'or reset it: BS=default',
            ] );
        }
        else // badge-theme
            if( ( exec_result = theme.exec( command ) ) )
        {
            // git-hub        #CB0000
            // stack overflow #FF8000
            // twitter        #1DA1F2
            // face-book      #4867AA
            switch( exec_result[ 1 ] )
            {
                case 'G':
                badges.colors[ 1 ] = '#CB0000';
                break;

                case 'S':
                badges.colors[ 1 ] = '#FF8000';
                break;

                case 'T':
                badges.colors[ 1 ] = '#1DA1F2';
                break;

                case 'F':
                badges.colors[ 1 ] = '#4867AA';
                break;

                default:
                badges.colors[ 1 ] = '#CB0000';
                break;
            }
            text( 'set background-suffix-color to ' + badges.colors[ 1 ] );
            screen.newline();
        }
        else // print help for badge-theme
        if( command.search( /^ *theme/ ) === 0 )
        {
            print( [
                'default badge-theme is github (G)',
                'but you can also use:',
                'stack-overflow => (S)',
                'titter         => (T)',
                'facebook       => (F)',
            ] );
        }
        // end of commands processing
        // if on the main.js we do not check for empty line
        // then here we should use and [if-else] statement
        // since I have used it on main.js, just [else] will be enough.
        else
        {
            text( command + ': command not found' );
            screen.newline();
        }
    }

    // handle Alter key
    this.alter = function( char )
    {
        switch( char )
        {
            // Alter + l: off/on console.log()
            case 'l':
            if( enable_log === true )
            {
                console.log( 'console log was disabled.' );
                enable_log = false;
            }
            else
            {
                console.log( 'console log was enabled.' );
                enable_log = true;
            }
            break;

            // open new table and goes to source code on git-hub
            case 'b':
            window.open( 'https://github.com/k-five/badge-for-git', '_blank' ).focus();
            break;

            case 'v':
            if( enable_svg_log === false )
            {
                enable_svg_log = true;
                text( 'log SVG-code to console was enabled.' );
            }
            else
            {
                enable_svg_log = false;
                text( 'log SVG-code to console was disabled.' );
            }
            screen.newline();
            screen.hide_cursor();
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row' );
            screen.cursor();
            screen.newline();
            break;

            // Alt-h print how-to-use
            case 'h':
            text( 'how-to-use:' );
            screen.newline();

            print( path.readable[ 'doc' ][ 'how-to-use' ] );

            screen.hide_cursor();
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row' );
            screen.cursor();
            screen.newline();
            break;

            // Alt-n print NOTE
            case 'n':
            text( 'NOTE:' );
            screen.newline();

            print( path.readable[ 'doc' ][ 'NOTE' ] );

            screen.hide_cursor();
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row' );
            screen.cursor();
            screen.newline();
            break;

            // Alt-c print contributor
            case 'c':
            text( 'contributor:' );
            screen.newline();

            print( path.readable[ 'doc' ][ 'contributor' ] );

            screen.hide_cursor();
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row' );
            screen.cursor();
            screen.newline();
            break;

            default:
            break;
        }
    }


    // handle Control + key
    this.control = function( char )
    {
        switch( char )
        {
            case 'u':
            if( screen.cursor_pos === 0 )
            {
                line_buffer_backup = screen.get( 'row' ).innerHTML;
                screen.get( 'row' ).innerHTML = '';
                screen.line_buffer = ''
            }
            break;

            case 'y':
            screen.get( 'row' ).innerHTML += line_buffer_backup;
            screen.line_buffer += line_buffer_backup;
            break;

            // clear the screen
            case 'l':
            screen.clear()
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row', screen.line_buffer );
            screen.cursor();
            screen.newline();

            // see init.js
            if( enable_log )
            {
                console.log( 'clear the screen with Control + L' );
            }
            break;

            // print help, equivalent to type: help
            case 'h':
            command.help();

            screen.hide_cursor();
            screen.prompt( path.get() );
            screen.add( 'SPAN', 'row' );
            screen.cursor();
            screen.newline();

            default:
            break;
        }
    }

    this.shift = function( char )
    {
        // currently nothing
    }


    this.ls = function()
    {
        var reserve_space = 20;
        var format_width  = ( reserve_space * screen.char_width );
        var widnow_width  = window.innerWidth;
        var max_width     = format_width;

        var size  = 0;
        var cwd   = path.cwd();
        var files = path.root[ cwd ];
        var width = window.innerWidth;
        var file;

        for( file in files )
        {
            // concatenation file name + ( 20 - file.length ) space for formatting output
            // like printf( "%-20s", file );
            text( file + " ".repeat( reserve_space - file.length ), path.root[ cwd ][ file ] );
            max_width += format_width;

            // if we are close/near to edge of window then we should add new line
            if( max_width >= widnow_width )
            {
                screen.newline();
                max_width = format_width;
            }
        }

        if( file !== undefined )
        {
            screen.newline();
        }
    }

    this.cd = function( arg )
    {
        var cwd = path.cwd();

        switch( arg )
        {
            // if the cd has no argument
            case undefined:
            break;

            case '~':
            path.pwd = [ 'home', 'badge-for-git' ];
            break;

            case '/':
            text( "cd: / Permission denied" );
            screen.newline();
            break;

            case '.':
            break;


            case '..':
            // if the last index of pwd equals "badge-for-git", then we do not have
            // permission to go further, it is just a dummy
            if( cwd === 'badge-for-git' )
            {
                text( "cd: " + path.pwd[ 1 ] + "/: Permission denied" );
                screen.newline();
            }
            else
            {
                // now we are not in the home directory and thus we can go back
                path.pwd.pop();

                cwd = path.cwd();
                for( var file in path.root[ cwd ] )
                {
                    text( file );
                    screen.newline();
                }
            }
            break;

            default:
            if( path.root[ cwd ][ arg ] === 'directory' && arg in path.root[ cwd ] )
            {
                path.pwd.push( arg );

                cwd = path.cwd();
                for( var file in path.root[ cwd ] )
                {
                    text( file );
                    screen.newline();
                }
            }
            else
            {
                text( 'cd (' + arg + ') No such file or directory' );
                screen.newline();
            }
            break;
        }
    } // end of cd

    this.clear = function()
    {
        screen.clear()

        screen.prompt( path.get() );
        screen.add( 'SPAN', 'row' );
        screen.cursor();
        screen.newline();

        if( enable_log )
        {
            console.log( 'clear the screen with clear command' );
        }
    }

    this.df = function()
    {
        var df =
            [
                'Filesystem     1K-blocks     Used Available Use% Mounted on',
                'udev             1011376        0   1011376   0% /dev',
                'tmpfs             206316     8956    197360   5% /run',
                '/dev/sda3      196730180 25927424 160786400  14% /',
                'tmpfs            1031568      596   1030972   1% /dev/shm',
                'tmpfs               5120        4      5116   1% /run/lock',
                'tmpfs            1031568        0   1031568   0% /sys/fs/cgroup',
                'tmpfs             206316       60    206256   1% /run/user/1000'
            ];

        print( df );
    }

    this.cat = function( arg )
    {
        var redirect = false;
        if( arg.indexOf( '&gt;' ) != -1 )
        {
            redirect = true;
            arg = arg.substr( arg.indexOf( '&gt;' ) + 4, arg.lenght ).trim();
        }
        else
        {
            arg = arg.trim();
        }

        var cwd = path.cwd();
        if( arg in path.root[ cwd ] )
        {
            if( path.root[ cwd ][ arg ] === 'readable' )
            {
                if( redirect === true )
                {
                    //write();
                }
                else
                {
                    print( path.readable[ cwd ][ arg ] );
                }
            }
            else
            {
                text(  arg + ' is a ' +  path.root[ cwd ][ arg ] + ' and NOT readable' )
                screen.newline();
            }
        }
        else
        {
            text(  '(' + arg + ') was not found in ' + cwd + ' directory' )
            screen.newline();
        }
    }

    this.history = function()
    {
        var length = this.histories.length;

        if( length > 0 )
        {
            var index = 0;
            while( index < length )
            {
                text( ( index + 1 ) + ': ' + this.histories[ index ] );
                screen.newline();
                ++index;
            }
        }
    }

    this.help = function()
    {
        var h =
            [
                'cmd:     arg:     des:',
                '......................',
                'ls       No       list files and directories' ,
                'cd       Yes      navigation between directories',
                'bc       Yes      set/reset background color',
                'fs       Yes      set/reset font size',
                'df       No       dumpy file-system report',
                'cat      Yes      read the contents of a file',
                'pwd      No       print current path',
                'echo     Yes      echos its arguments',
                'date     No       print date in GMT',
                'help     No       print (this) help',
                'open     Yes      open a media',
                'clear    No       clear the screen',
                'history  No       print all entered commands',
                '',
                'badge    Yes      mine command, create badge',
                'bfs      Yes      badge-font-size, set font-size for badges (all)',
                'hwf      No       show height, width, and font-size',
                'shc      No       show clipboard for copying source code',
                '                  You no need to use this command since by',
                '                  default it will be copied to your clipboard.',
                '                  It is there for old-browsers.',
                'theme    Yes      set a theme default is G. use: G,S,T or F',
                '                  G:github, S:stack-overflow, T:twitter, F:facebook',
                'TF=      Yes      text-fill, (button/badge) default: #FFF',
                'DLM=     Yes      delimiter,                default: 0,  range[5-99]',
                'BCL=     yes      button-char-length,       default: 10, range[5-99]',
                'BS=      Yes      button-stroke,            default: #CB0000',
                'BSW=     Yes      button-stroke-width,      default: 0,  range[0-9]',
                '',
                'some key bindings:',
                '..................',
                'Control + l    : clear the screen',
                'Control + h    : print help',
                'Alter   + l    : enable/disable console.log()',
                'Alter   + b    : open source code of the application',
                'Alter   + h    : print "how-to-use" file in doc directory',
                'Alter   + n    : print "NOTE" file in doc directory',
                'Alter   + c    : print "contributor" file in doc directory',
                'Alter   + v    : enable/disable logging SVG-source-code in console',
                'TAB            : tab completion for file/directory names',
                'Alter   + u    : cut the whole line (= left side of the cursor)',
                'Alter   + y    : paste (= yank) the last line by Alter-u',
            ];

        print( h );

        // if there is the 'guide', then it will return non-null;
        // otherwise it will return null. But with doc.class it does not return
        // "null" and return "undefined". Thus if we use "class" if statement
        // should use "undefined" and if we use "id" it should use "null"
        var guide = doc.id( 'guide' );
        if( guide !== null )
        {
            doc.id( 'terminal' ).removeChild( guide );
            var copyright = document.createElement( 'SPAN' );
            copyright.innerHTML = '<p id="copyright">badge-for-git Copyright &copy; ' + ( ( Date().toString().split( ' ' ) )[3] ) + ' Shakiba <sup><a href="https://github.com/k-five/badge-for-git" target="_blank">src</a></sup></p>';
            document.body.appendChild( copyright );
        }
    } // end of help

    function text( string, class_name = "text" )
    {
        var span = document.createElement( 'SPAN' );

        var contents = document.createTextNode( string );
        span.appendChild( contents );

        doc.id( 'terminal' ).appendChild( span );
        span.classList.add( class_name );
    }

    function print( contents )
    {
        var length = contents.length;
        var index = 0;

        while( index < length )
        {
            text( contents[ index ] );
            screen.newline();
            ++index;
        }
    }
}
console.log( 'Command.js was loaded.' );
