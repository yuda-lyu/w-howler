# w-howler
A wrapper howler for audio player.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-howler.svg?style=flat)](https://npmjs.org/package/w-howler) 
[![license](https://img.shields.io/npm/l/w-howler.svg?style=flat)](https://npmjs.org/package/w-howler) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-howler/master/dist/w-howler.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-howler)
[![npm download](https://img.shields.io/npm/dt/w-howler.svg)](https://npmjs.org/package/w-howler) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-howler.svg)](https://www.jsdelivr.com/package/npm/w-howler)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-howler/global.html).

## Example
To view some examples for more understanding, visit examples:

> **audio play:** [web](https://yuda-lyu.github.io/w-howler/examples/web.html) [[source code](https://github.com/yuda-lyu/w-howler/blob/master/docs/examples/web.html)]

## Installation
### In a browser(UMD module):
> **Note:** w-howler is not dependent on any package, has included `howler` and `eventemitter3`.

> **Note:** umd file includes with `lodash`, by using tree-shaking for dead-code elimination.

[Necessary] Add script for w-howler.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-howler@1.0.16/dist/w-howler.umd.js"></script>
```

#### Example for audio play:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-howler/blob/master/web.html)]
```alias
<body>

    <script>
        let WHowler = window['w-howler']
    </script>

    <div style="margin:20px; padding-bottom:10px;">
        <div style="font-size:1.5rem; padding-bottom:5px;">1. Normal play</div>
        <input type="file" onchange="whPlay1(this)">
        <pre id="msg1"></pre>
        <button onclick="whStop1()">stop</button>
    </div>

    <script>
        let wh1 = new WHowler()

        function whPlay1(ele){
            let files=ele.files
            let file=files[0]
            let src=URL.createObjectURL(file)

            //play
            wh1.play(src)

            //getSeek
            setInterval(function(){
                document.querySelector('#msg1').innerHTML=JSON.stringify(wh1.getSeek())
            },1000)

        }

        function whStop1(){
            wh1.stop()
        }

    </script>

    <div style="margin:20px; padding-bottom:10px;">
        <div style="font-size:1.5rem; padding-bottom:5px;">2. Function play</div>
        <input type="file" onchange="whPlay2(this)">
        <pre id="msg2"></pre>
        <button onclick="whStop2()">stop</button>
    </div>

    <script>
        let wh2 = new WHowler()

        function whPlay2(ele){
            let files=ele.files
            let file=files[0]
            let src=URL.createObjectURL(file)

            //play
            wh2.play(src)

            //getSeek
            setInterval(function(){
                document.querySelector('#msg2').innerHTML=JSON.stringify(wh2.getSeek())
            },1000)

            //seek to 50% in 6 sec.
            setTimeout(function(){
                wh2.seek(0.5)
            },6000)

            //pause in 9 sec.
            setTimeout(function(){
                wh2.pause()
            },9000)

            //resume in 12 sec.
            setTimeout(function(){
                wh2.resume()
            },12000)

        }

        function whStop2(){
            wh2.stop()
        }

    </script>

</body>
```