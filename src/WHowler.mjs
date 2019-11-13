import toString from 'lodash/toString'
import isNumber from 'lodash/isNumber'
import each from 'lodash/each'
import uniqueId from 'lodash/uniqueId'
import { Howl } from 'howler'
import mitt from 'mitt'


/**
 * 封裝音頻播放Howler
 * 
 * See: {@link https://github.com/goldfire/howler.js/ Howler.js}
 *
 * @returns {Object} 回傳事件觸發器物件，包含seek、getSeek、pause、resume、stop、play，play輸入為網址與副檔名(預設mp3)，包含on與emit事件，on為註冊監聽事件，emit為觸發事件
 */
function WHowler(){
    let adp=null
    let adps=[]
    let adpID=null

    //ev
    let ev = new mitt()

    function seek(r){
        if(adp!==null){
            try{
                let s=getSeek()
                adp.seek(r*s.tall)
                emitRefresh()
            }catch(e){}
        }
    }
    ev.seek=seek

    function getSeek(){
        let r=null
        if(adp!==null){
            let t=adp.seek()
            let tall=adp.duration()
            if(isNumber(t) && isNumber(tall)){
                r= {
                    t,
                    tall,
                    r:t/tall,
                }
            }
        }
        return r
    }
    ev.getSeek=getSeek
    
    function pause(){
        if(adp!==null){
            try{
                adp.pause()
            }catch(e){}
        }
    }
    ev.pause=pause
    
    function resume(){
        if(adp!==null){
            try{
                adp.play()
            }catch(e){}
        }
    }
    ev.resume=resume
    
    function stop(){
        if(adp!==null){
            try{
                adp.stop()
            }catch(e){}
            adp=null
        }
    }
    ev.stop=stop
    
    function play(src, format='mp3'){
        let err=null

        //_adpID
        let _adpID=uniqueId('p')
        adpID=_adpID

        //play
        adp = new Howl({
            src,
            format,
        })
        try{
            adp.play()
        }
        catch(e){
            err=e
        }

        //check
        if(err!==null){
            console.log(err)
            return
        }

        //check no stop adp and push now adp
        each(adps,(v)=>{
            if(v.state()==='loading'){
                v.on('load', function(){
                    v.stop()
                })
            }
            else{
                v.stop()
            }
        })
        adps.push(adp)

        //onEnd
        adp.on('end', function(){
            if(adpID===_adpID){ //有可能剛好播放結束又指定切換導致重複播放
                ev.emit('end',adpID)
            }
        })

        //clear, n秒後清除已載入且不是播放中的adp
        setTimeout(()=>{
            let _adps=[]
            each(adps,(v)=>{
                if(!(v.state()==='loaded' && !v.playing())){
                    _adps.push(v)
                }
            })
            adps=_adps
        },5000)

    }
    ev.play=play
    
    function fmtTime(t){
        function f2(i){
            if(i<10){
                return '0'+toString(i)
            }
            return toString(i)
        }
        let h = Math.floor(t / 3600)
        let m = Math.floor(t % 3600 / 60)
        let s = Math.floor(t % 3600 % 60)
        let ch = h > 0 ? f2(h)+':' : ''
        let cm = f2(m)+':'
        let cs = f2(s)
        return `${ch}${cm}${cs}` 
    }

    function emitRefresh(){
        setTimeout(function(){
            let s=getSeek()
            if(s!==null){
                let prog=s.r*100
                let timeNow=fmtTime(s.t)
                let timeEnd=fmtTime(s.tall)
                let timeShow=`${timeNow}/${timeEnd}`
                ev.emit('refresh',{prog,timeNow,timeEnd,timeShow})
            }
        },1)
    }

    setInterval(()=>{
        emitRefresh()
    },50)

    return ev
}


export default WHowler