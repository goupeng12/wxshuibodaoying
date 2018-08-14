//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    img_src:'',
    tempFilePaths: '', 
    imgwidth:0,
    imgheight:0,
    window_height:0,
    window_width:0,
    canvasWidth:0,
    canvasHeight:0,
  },
  startToMakeWave6:function(){
    if(this.data.img_src != ''){
        var context = wx.createCanvasContext('canvas');
        var w,h;

        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.draw(false,()=>{
            console.log('finished rrrrrrrrrrrrrrrrrr');
            wx.canvasGetImageData({
                canvasId: 'canvas',
                x: 0,
                y: 0,
                width: w,
                height: h,
                success(res) {
                    console.log("进入军事基地")
                    console.log(res.width) // 100
                    console.log(res.height) // 100
                    console.log(res.data instanceof Uint8ClampedArray) // true
                    console.log(res.data.length) // 100 * 100 * 4
                    console.log(res.data)
                }
            })
        })
    }
  },
  startToMakeWave:function(){
    if(this.data.img_src != ''){
        var settings = {
            'speed':    1.5,//水波运动的速度
            'scale':    1.5,//水波波峰的高低
            'waves':    6,//水波的数量
            'image':    true
        }

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        var w, h, dw, dh;
        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];
        var img_loaded = false;

        var context = wx.createCanvasContext('canvas');

        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.scale(1,-1)
        context.drawImage(this.data.img_src,0,-h*2,w,h);
        context.draw(false,()=>{
            console.log('finished rrrrrrrrrrrrrrrrrr');
            img_loaded = true;
            h = 2*h;
            dw = w;
            dh = h/2;

            wx.canvasGetImageData({
                canvasId: 'canvas',
                x: 0,
                y: dh,
                width: dw,
                height: dh,
                success(res) {
                    console.log("进入军事基地")
                    console.log(res.width) // 100
                    console.log(res.height) // 100
                    console.log(res.data instanceof Uint8ClampedArray) // true
                    console.log(res.data.length) // 100 * 100 * 4
                    
                    var end = false;
                    var id = res.data;
                    console.log('data is :')
                    console.log(id)
                    frames.push(res.data);
                    while(!end){
                        console.log('len is %d',frames.length);
                        /*var odd = frames[frames.length-1];
                        var od = odd.data;*/
                        var od = new Uint8ClampedArray(frames[frames.length-1]);
                        var pixel = 0;
                        for (var y = 0; y < dh; y++){
                            for (var x = 0; x < dw; x++){
                                var displacement = (scale * 10 * (Math.sin((dh/(y/waves)) + (-offset)))) | 0;
                                var j = ((displacement + y) * w + x + displacement)*4;

                                // horizon flickering fix
                                if (j < 0) {
                                    pixel += 4;
                                    continue;
                                }

                                // edge wrapping fix
                                var m = j % (w*4);
                                var n = scale * 10 * (y/waves);

                                if (m < n || m > (w*4)-n) {
                                    var sign = y < w/2 ? 1 : -1;
                                    od[pixel]   = od[pixel + 4 * sign];
                                    od[++pixel] = od[pixel + 4 * sign];
                                    od[++pixel] = od[pixel + 4 * sign];
                                    od[++pixel] = od[pixel + 4 * sign];
                                    ++pixel;
                                    continue;
                                }

                                if (id[j+3] != 0) {
                                    od[pixel]   = id[j];
                                    od[++pixel] = id[++j];
                                    od[++pixel] = id[++j];
                                    od[++pixel] = id[++j];
                                    ++pixel;
                                } else {
                                    od[pixel]   = od[pixel - w*4];
                                    od[++pixel] = od[pixel - w*4];
                                    od[++pixel] = od[pixel - w*4];
                                    od[++pixel] = od[pixel - w*4];
                                    ++pixel;
                                    // pixel += 4;
                                }                
                            }
                        }

                        console.log('exit double for')
                        if (offset > speed * (16/speed)) {
                            offset = 0;
                            max_frames = frame - 1;
                            // frames.pop();
                            frame = 0;
                            end = true;
                        } else {
                            console.log('offset is %d, speed is %d, calculate speed is %d',offset,speed,speed * (6/speed));
                            offset += speed;
                            frame++;
                        }
                        frames.push(od);
                    }

                    console.log('data is :');
                    for (var y = 0; y < frames.length; y++){
                        console.log(frames[y]);
                    }
                        
                }
            })
            this.interval = setInterval(function(){
                if (img_loaded) {
                    if (!settings.image) {
                        //c.putImageData(frames[frame], 0, 0);
                        wx.canvasPutImageData({
                            canvasId: 'canvas',
                            x: 0,
                            y: 0,
                            width: w,
                            data: frames[frame],
                            success(res) {
                                console.log("canvasPutImageData success A");
                                console.log(res);
                            }
                        })
                    } else {
                        //c.putImageData(frames[frame], 0, h/2);
                        wx.canvasPutImageData({
                            canvasId: 'canvas',
                            x: 0,
                            y: h/2,
                            width: w,
                            data: frames[frame],
                            success(res) {
                                console.log("canvasPutImageData success B");
                                console.log(res);
                            }
                        })
                    }
                    // c.putImageData(frames[frame], 0, h/2);
                    if (frame < max_frames) {
                        frame++;
                    } else {
                        frame = 0;
                    }
                }
            }, 33)
            
        })
            
    }
  },
  startToMakeWave4:function(){
    if(this.data.img_src != ''){
        console.log('img_src is %s',(this.data.img_src))
        console.log('tempFilePaths is %s',(this.data.tempFilePaths)[0])

        var settings = {
            'speed':    1,//水波运动的速度
            'scale':    1,//水波波峰的高低
            'waves':    10,//水波的数量
            'image':    true
        }

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        var w, h, dw, dh;
        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];
        var img_loaded = false;

        var context = wx.createCanvasContext('canvas');

        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.scale(1,-1)
        context.drawImage(this.data.img_src,0,-h*2,w,h);
        context.draw({
          reserve: false,
          callback: function (e) {
            console.log('finished rrrrrrrrrrrrrrrrrr')
          }
        })
        wx.canvasGetImageData({
            canvasId: 'canvas',
            x: 0,
            y: h/2,
            width: w,
            height: h,
            success(res) {
                console.log("进入军事基地")
                console.log(res.width) // 100
                console.log(res.height) // 100
                console.log(res.data instanceof Uint8ClampedArray) // true
                console.log(res.data.length) // 100 * 100 * 4
            }
        })

        wx.canvasGetImageData({
            canvasId: 'canvas',
            x: 0,
            y: h/2,
            width: w,
            height: h,
            success(res) {
                console.log("进入军事基地2")
                console.log(res.width) // 100
                console.log(res.height) // 100
                console.log(res.data instanceof Uint8ClampedArray) // true
                console.log(res.data.length) // 100 * 100 * 4
            }
        })

        const data = new Uint8ClampedArray([255, 0, 0, 1])
        wx.canvasPutImageData({
            canvasId: 'canvas',
            x: 0,
            y: 0,
            width: 1,
            data: data,
            success(res) {
                console.log("canvasPutImageData success");
                console.log(res);
            }
        })
    }
  },
  startToMakeWave2:function(){
    if(this.data.img_src != ''){
        console.log('img_src is %s',(this.data.img_src))
        console.log('tempFilePaths is %s',(this.data.tempFilePaths)[0])

        var settings = {
            'speed':    1,//水波运动的速度
            'scale':    1,//水波波峰的高低
            'waves':    10,//水波的数量
            'image':    true
        }

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        var w, h, dw, dh;
        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];
        var img_loaded = false;

        var context = wx.createCanvasContext('canvas');

        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.scale(1,-1)
        context.drawImage(this.data.img_src,0,-h*2,w,h);
        context.draw({
          reserve: false,
          callback: function (e) {
            console.log('finished rrrrrrrrrrrrrrrrrr')
          }
        })
        wx.canvasGetImageData({
            canvasId: 'canvas',
            x: 0,
            y: h/2,
            width: w,
            height: h,
            success(res) {
                console.log("进入军事基地")
                console.log(res.width) // 100
                console.log(res.height) // 100
                console.log(res.data instanceof Uint8ClampedArray) // true
                console.log(res.data.length) // 100 * 100 * 4
                const data = new Uint8ClampedArray([255, 0, 0, 1])
                wx.canvasPutImageData({
                    canvasId: 'canvas',
                    x: 0,
                    y: 0,
                    width: 1,
                    data: data,
                    success(res) {
                        console.log("canvasPutImageData success");
                        console.log(res);
                        wx.canvasGetImageData({
                            canvasId: 'canvas',
                            x: 0,
                            y: h/2,
                            width: w,
                            height: h,
                            success(res) {
                                console.log("inter canvasGetImageData success");
                                console.log(res);
                            },
                            fail(res){
                                console.log("inter canvasGetImageData failed");
                                console.log(res);
                            }
                        })
                  
                    },
                    fail(res) {
                        console.log("canvasPutImageData failed");
                        console.log(res);
                    }
                })
            },
            fail(res) {
                    console.log("canvasGetImageData failed");
                    console.log(res);
            }
        })
    }
  },
  startToMakeWave1:function(){
    console.log('startToMakeWave')
  },
  startToMakeWave3:function(){

    /*var img = document.getElementById('image1');
    console.log('KKKKKKKKKKKKKKKKK    w is %d, h is %d',img.width,img.height);*/

    if(this.data.img_src != ''){
        console.log('img_src is %s',(this.data.img_src))
        console.log('tempFilePaths is %s',(this.data.tempFilePaths)[0])

        var settings = {
            'speed':    1,//水波运动的速度
            'scale':    1,//水波波峰的高低
            'waves':    10,//水波的数量
            'image':    true
        }

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        var w, h, dw, dh;
        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];
        var img_loaded = false;

        var context = wx.createContext();
        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.scale(1,-1)
        context.drawImage(this.data.img_src,0,-h*2,w,h);
        wx.drawCanvas({
            canvasId: 'canvas',
            actions: context.getActions()
        })
        img_loaded = true;
        context.restore();
        /*w = c.canvas.width;
        h = c.canvas.height;*/
        /*w = this.data.imgwidth;
        h = this.data.imgheight*2;*/
        dw = w;
        dh = h/2;

        console.log('first_loaded is false, begin to call canvasGetImageData')

        var first_loaded = false;
        var first_res = null;

        wx.canvasGetImageData({
            canvasId: 'canvas',
            x: 0,
            y: h/2,
            width: w,
            height: h,
            success(res) {
                console.log("before")
                console.log(res.width) // 100
                console.log(res.height) // 100
                console.log(res.data instanceof Uint8ClampedArray) // true
                console.log(res.data.length) // 100 * 100 * 4

                first_loaded = true;
                first_res = res;
                wx.canvasGetImageData({
                    canvasId: 'canvas',
                    x: 0,
                    y: h/2,
                    width: w,
                    height: h,
                    success(res){
                        console.log('进入卡兰达...')
                        console.log("before")
                        console.log(res.width) // 100
                        console.log(res.height) // 100
                        console.log(res.data instanceof Uint8ClampedArray) // true
                        console.log(res.data.length) // 100 * 100 * 4
                },
                fail(res) {
                    console.log("faild",res);
                }
            })
            },
            fail(res) {
                console.log("faild",res);
            }
        })

        /*while(first_loaded == false);

        console.log('first_loaded is true')

        var id = res.data;
        var end = false;
        context.save();
        while (!end) {
            console.log('计算中...')
            var second_loaded = false;
            var second_res = null;
            wx.canvasGetImageData({
                canvasId: 'canvas',
                x: 0,
                y: h/2,
                width: w,
                height: h,
                success(res){
                    console.log('进入卡兰达...')
                    second_loaded = true;
                    second_res = res;
                }
            })
            while(second_loaded == false);
            var odd = second_res// 获取倒影图像像素
            var od = odd.data;
            var pixel = 0;
            for (var y = 0; y < dh; y++){
                for (var x = 0; x < dw; x++){
                    var displacement = (scale * 10 * (Math.sin((dh/(y/waves)) + (-offset)))) | 0;
                    var j = ((displacement + y) * w + x + displacement)*4;

                    // horizon flickering fix
                    if (j < 0) {
                        pixel += 4;
                        continue;
                    }

                    // edge wrapping fix
                    var m = j % (w*4);
                    var n = scale * 10 * (y/waves);

                    if (m < n || m > (w*4)-n) {
                        var sign = y < w/2 ? 1 : -1;
                        od[pixel]   = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        ++pixel;
                        continue;
                    }

                    if (id[j+3] != 0) {
                        od[pixel]   = id[j];
                        od[++pixel] = id[++j];
                        od[++pixel] = id[++j];
                        od[++pixel] = id[++j];
                        ++pixel;
                    } else {
                        od[pixel]   = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        ++pixel;
                        // pixel += 4;
                    }                
                }
            }

            console.log('exit double for')
            if (offset > speed * (6/speed)) {
                offset = 0;
                max_frames = frame - 1;
                // frames.pop();
                frame = 0;
                end = true;
            } else {
                console.log('offset is %d, speed is %d, calculate speed is %d',offset,speed,speed * (6/speed));
                offset += speed;
                frame++;
            }
            frames.push(odd);
        }

        console.log('计算结束')*/
    }
  },
  startToMakeWave2:function(){

    /*var img = document.getElementById('image1');
    console.log('KKKKKKKKKKKKKKKKK    w is %d, h is %d',img.width,img.height);*/

    if(this.data.img_src != ''){
        console.log('img_src is %s',(this.data.img_src))
        console.log('tempFilePaths is %s',(this.data.tempFilePaths)[0])

        var settings = {
            'speed':    1,//水波运动的速度
            'scale':    1,//水波波峰的高低
            'waves':    10,//水波的数量
            'image':    true
        }

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        var w, h, dw, dh;
        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];
        var img_loaded = false;

        var context = wx.createContext();
        context.save();
        w = this.data.window_width;
        h = this.data.window_width / this.data.imgwidth * this.data.imgheight;
        console.log('HHHHHHH    w is %d, h is %d',w,h);
        context.drawImage(this.data.img_src,0,0,w,h);
        context.scale(1,-1)
        context.drawImage(this.data.img_src,0,-h*2,w,h);
        wx.drawCanvas({
            canvasId: 'canvas',
            actions: context.getActions()
        })
        img_loaded = true;
        context.restore();
        /*w = c.canvas.width;
        h = c.canvas.height;*/
        /*w = this.data.imgwidth;
        h = this.data.imgheight*2;*/
        dw = w;
        dh = h/2;

        wx.canvasGetImageData({
            canvasId: 'canvas',
            x: 0,
            y: h/2,
            width: w,
            height: h,
            success(res) {
                console.log("before")
                console.log(res.width) // 100
                console.log(res.height) // 100
                console.log(res.data instanceof Uint8ClampedArray) // true
                console.log(res.data.length) // 100 * 100 * 4

                var id = res.data;
                var end = false;
                context.save();
                while (!end) {
                    console.log('计算中...')
                    wx.canvasGetImageData({
                        canvasId: 'canvas',
                        x: 0,
                        y: h/2,
                        width: w,
                        height: h,
                        success(res){
                            console.log('进入卡兰达...')
                            var odd = res// 获取倒影图像像素
                            var od = odd.data;
                            var pixel = 0;
                            for (var y = 0; y < dh; y++){
                                for (var x = 0; x < dw; x++){
                                    var displacement = (scale * 10 * (Math.sin((dh/(y/waves)) + (-offset)))) | 0;
                                    var j = ((displacement + y) * w + x + displacement)*4;

                                    // horizon flickering fix
                                    if (j < 0) {
                                        pixel += 4;
                                        continue;
                                    }

                                    // edge wrapping fix
                                    var m = j % (w*4);
                                    var n = scale * 10 * (y/waves);

                                    if (m < n || m > (w*4)-n) {
                                        var sign = y < w/2 ? 1 : -1;
                                        od[pixel]   = od[pixel + 4 * sign];
                                        od[++pixel] = od[pixel + 4 * sign];
                                        od[++pixel] = od[pixel + 4 * sign];
                                        od[++pixel] = od[pixel + 4 * sign];
                                        ++pixel;
                                        continue;
                                    }

                                    if (id[j+3] != 0) {
                                        od[pixel]   = id[j];
                                        od[++pixel] = id[++j];
                                        od[++pixel] = id[++j];
                                        od[++pixel] = id[++j];
                                        ++pixel;
                                    } else {
                                        od[pixel]   = od[pixel - w*4];
                                        od[++pixel] = od[pixel - w*4];
                                        od[++pixel] = od[pixel - w*4];
                                        od[++pixel] = od[pixel - w*4];
                                        ++pixel;
                                        // pixel += 4;
                                    }                
                                }
                            }

                            console.log('exit double for')
                            if (offset > speed * (6/speed)) {
                                offset = 0;
                                max_frames = frame - 1;
                                // frames.pop();
                                frame = 0;
                                end = true;
                            } else {
                                console.log('offset is %d, speed is %d, calculate speed is %d',offset,speed,speed * (6/speed));
                                offset += speed;
                                frame++;
                            }
                            frames.push(odd);
                        },
                        fail(res) {
                            console.log("faild",res)
                        }
                    })
                }
            },
            fail(res) {
                console.log("faild",res)
            }
        })

        console.log('计算结束')

        /*this.interval = setInterval(function(){
            console.log('jjjjjjjjjjj');
            if (img_loaded) {
                if (!settings.image) {
                    wx.canvasPutImageData({
                        canvasId: 'myCanvas',
                        x: 0,
                        y: 0,
                        width: w,
                        data: frames[frame],
                        success(res) {}
                    })
                } else {
                    wx.canvasPutImageData({
                        canvasId: 'myCanvas',
                        x: 0,
                        y: h/2,
                        width: w,
                        data: frames[frame],
                        success(res) {}
                    })
                }
                // c.putImageData(frames[frame], 0, h/2);
                if (frame < max_frames) {
                    frame++;
                } else {
                    frame = 0;
                }
            }
        }, 17)*/

        
    /*this.lake()
    this.interval = setInterval(this.lake, 17)*/
    }
  },
  lake:function(){
    
  },
  chooseimage:function(){
    console.log('in chooseimage');
    var _this = this;  
    wx.chooseImage({  
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {  
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        _this.setData({  
            tempFilePaths:res.tempFilePaths  ,
            img_src:res.tempFilePaths[0]
        }) 
        wx.getImageInfo({
              src: res.tempFilePaths[0],
              success: function (res) {
                _this.setData({imgwidth:res.width,imgheight:res.height,})
              }
          }) 
      }  
    })  
  },
  onLoad: function () {
    this.setData({
      window_height: wx.getSystemInfoSync().windowHeight,
      window_width: wx.getSystemInfoSync().windowWidth
    })
    console.log("w is %d, h is %d",this.data.window_width,this.data.window_height)
    
  },
  getUserInfo: function(e) {
    console.log('enter getUserInfo')
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })

    console.log('exit getUserInfo')
  },
  onUnload: function () {
    clearInterval(this.interval)
  }
})
