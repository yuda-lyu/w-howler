import hw from 'howler'
import EventEmitter from 'eventemitter3'
import toString from 'lodash/toString'
import isNumber from 'lodash/isNumber'


let Howl = hw.Howl


function fmtTime(t) {
    function f2(i) {
        if (i < 10) {
            return '0' + toString(i)
        }
        return toString(i)
    }
    let h = Math.floor(t / 3600)
    let m = Math.floor(t % 3600 / 60)
    let s = Math.floor(t % 3600 % 60)
    let ch = h > 0 ? f2(h) + ':' : ''
    let cm = f2(m) + ':'
    let cs = f2(s)
    return `${ch}${cm}${cs}`
}


/**
 * 封裝音頻播放Howler
 *
 * See: {@link https://github.com/goldfire/howler.js/ Howler.js}
 *
 * @returns {Object} 回傳事件觸發器物件，包含seek、getSeek、getState、pause、resume、stop、play、end，play輸入為網址與副檔名(預設mp3)，包含on與emit事件，on為註冊監聽事件，emit為觸發事件
 */
function WHowler() {
    let adp = null

    //ev
    let ev = new EventEmitter()

    function seek(r) {
        if (adp === null) {
            return
        }
        try {
            let s = getSeek()
            adp.seek(r * s.tall)
            emitRefresh()
        }
        catch (e) {}
    }
    ev.seek = seek

    function getSeek() {
        let r = null
        if (adp === null) {
            return r
        }
        try {
            let t = adp.seek()
            let tall = adp.duration()
            if (isNumber(t) && isNumber(tall)) {
                r = {
                    t,
                    tall,
                    r: t / tall,
                }
            }
        }
        catch (e) {}
        return r
    }
    ev.getSeek = getSeek

    function getState() {
        let r = null
        if (adp === null) {
            return r
        }
        try {
            r = adp.state()
        }
        catch (e) {}
        return r
    }
    ev.getState = getState

    function pause() {
        if (adp === null) {
            return
        }
        try {
            adp.pause()
        }
        catch (e) {}
    }
    ev.pause = pause

    function resume() {
        if (adp === null) {
            return
        }
        try {
            adp.play()
        }
        catch (e) {}
    }
    ev.resume = resume

    function stopForce(adpTar) {
        try {
            adpTar.stop()
            adpTar.unload()
        }
        catch (e) {
            // console.log('stopForce', e)
        }
    }

    function stopTar(adpTar) {
        if (adpTar === null) {
            return
        }
        let t = setInterval(() => { //為loading時可能無法呼叫stop與unload, 故得用timer偵測
            stopForce(adpTar)
            if (adpTar.state() === 'unloaded') {
                adpTar = null
                clearInterval(t)
            }
        }, 1)
    }

    function stop() {
        if (adp === null) {
            return
        }
        stopTar(adp)
    }
    ev.stop = stop

    function play(src, format = 'mp3') {

        //check
        if (adp !== null) {
            let adpTar = adp
            stopTar(adpTar)
        }

        //play
        try {
            adp = new Howl({
                src,
                format,
            })
        }
        catch (err) {
            emitError({ from: 'new Howl', err })
            return
        }

        try {
            adp.play()
        }
        catch (err) {
            emitError({ from: 'play', err })
            return
        }

        //refresh
        adp.timer = setInterval(() => {
            //console.log('timer refresh', adp.timer)
            emitRefresh()
        }, 50)

        //loaderror
        adp.on('loaderror', function() {
            emitError('loaderror')
            stop()
        })

        //playerror
        adp.on('playerror', function() {
            emitError('playerror')
            stop()
        })

        //end
        adp.on('end', function() {
            emitFinish()
            stop()
        })

    }
    ev.play = play

    function emitFinish() {
        setTimeout(function() {
            ev.emit('end')
        }, 1)
    }

    function emitError(err) {
        setTimeout(function() {
            ev.emit('error', { err })
        }, 1)
    }

    function emitRefresh() {
        setTimeout(function() {
            let s = getSeek()
            if (s !== null) {
                let prog = s.r * 100
                let timeNow = fmtTime(s.t)
                let timeEnd = fmtTime(s.tall)
                let timeShow = `${timeNow}/${timeEnd}`
                ev.emit('refresh', { prog, timeNow, timeEnd, timeShow })
            }
        }, 1)
    }

    return ev
}


export default WHowler
