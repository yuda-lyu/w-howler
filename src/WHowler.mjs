import toString from 'lodash/toString'
import isNumber from 'lodash/isNumber'
import each from 'lodash/each'
import uniqueId from 'lodash/uniqueId'
import { Howl } from 'howler'
import Mitt from 'mitt'


/**
 * 封裝音頻播放Howler
 *
 * See: {@link https://github.com/goldfire/howler.js/ Howler.js}
 *
 * @returns {Object} 回傳事件觸發器物件，包含seek、getSeek、getState、pause、resume、stop、play、end，play輸入為網址與副檔名(預設mp3)，包含on與emit事件，on為註冊監聽事件，emit為觸發事件
 */
function WHowler() {
    let adp = null
    let adps = []
    let adpID = null

    //ev
    let ev = new Mitt()

    function seek(r) {
        if (adp !== null) {
            try {
                let s = getSeek()
                adp.seek(r * s.tall)
                emitRefresh()
            }
            catch (e) {}
        }
    }
    ev.seek = seek

    function getSeek() {
        let r = null
        if (adp !== null) {
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
        return r
    }
    ev.getSeek = getSeek

    function getState() {
        let r = null
        if (adp !== null) {
            r = adp.state()
        }
        return r
    }
    ev.getState = getState

    function pause() {
        if (adp !== null) {
            try {
                adp.pause()
            }
            catch (e) {}
        }
    }
    ev.pause = pause

    function resume() {
        if (adp !== null) {
            try {
                adp.play()
            }
            catch (e) {}
        }
    }
    ev.resume = resume

    function stop() {
        if (adp !== null) {
            try {
                adp.stop()
                adp.unload()
                clearInterval(adp.timer)
            }
            catch (e) {}
            adp = null
        }
    }
    ev.stop = stop

    function play(src, format = 'mp3') {
        let err = null

        //_adpID
        let _adpID = uniqueId('p')
        adpID = _adpID

        //play
        try {
            adp = new Howl({
                src,
                format,
            })
        }
        catch (e) {
            err = e
        }
        if (err !== null) {
            console.log('new Howl catch', err)
            return
        }

        try {
            adp.play()
        }
        catch (e) {
            err = e
        }
        if (err !== null) {
            console.log('play catch', err)
            return
        }

        //refresh
        adp.timer = setInterval(() => {
            //console.log('timer refresh', adp.timer)
            emitRefresh()
        }, 50)

        //check no stop adp
        each(adps, (v) => {
            if (v.state() === 'loading') {
                v.on('load', function() {
                    setTimeout(() => {
                        v.stop()
                        v.unload()
                        clearInterval(v.timer)
                    }, 1)
                })
            }
            else {
                v.stop()
                v.unload()
                clearInterval(v.timer)
            }
        })

        //loaderror
        adp.on('loaderror', function() {
            ev.emit('error', 'loaderror')
            stop()
        })

        //playerror
        adp.on('playerror', function() {
            ev.emit('error', 'playerror')
            stop()
        })

        //end
        adp.on('end', function() {
            if (adpID === _adpID) { //有可能剛好播放結束又指定切換導致重複播放
                ev.emit('end', adpID)
            }
        })

        //push self, 若直接於play時先stop與unload adp, 會因為可能按超快導致adp還在loading, 此時可能無法順利完成stop與unload, 故只好用queue先存後停止與釋放
        adps.push(adp)

        //clear, 5秒後清除
        setTimeout(() => {
            let _adps = []
            each(adps, (v) => {
                if (!(v.state() === 'loaded' && !v.playing())) { //保留已載入但不是播放中的adp
                    _adps.push(v)
                }
                else if (v.playing()) { //保留播放中的adp
                    _adps.push(v)
                }
            })
            adps = _adps
        }, 5000)

    }
    ev.play = play

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
