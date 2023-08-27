"use strict";

// import tinycolor from "./tinycolor.js";
import {TimeTracker, exist, clamp, isValidFunction} from "../../assets/js/utils.js";

export default class ColorPicker{


    //=== letIABLES ===============================================================================

    //--- HTML Elements ---------------------------------------------------------------------------

    #colorPickerElement; //? The container of all the other HTML elements that form the color picker

    #spectrumMap = {}; //? The canvas where we draw the spectrum of the color
    #spectrumMapCursor; //? The cursor we use to select the shade in the spectrum map

    #hueMap = {}; //? The canvas where we draw the hue color progression
    #hueMapCursor; //? The cursor we use to select the hue of the color

    #hex = {};
    #hue = {};
    #saturation = {};
    #vibrance = {};
    #alpha = {};

    #onChangeEvent;
    
    //--- Other ---------------------------------------------------------------------------

    //| Constructor

    /**
     * Creates a color picker inside the provided container
     * 
     * @param {HTMLElement} container The element where the color picker will be placed.
     * @param {String} baseColor It's the default color that will be applied to the color picker at it's creation; it must be a Hex 8 String (#????????)
     * 
     * @returns a pretty color picker :)
    */
    constructor(container, baseColor){

        let temp;

        this.#colorPickerElement = document.createElement('div');
        this.#colorPickerElement.classList.add('csavier-color-picker');
        this.#colorPickerElement.id = 'csavier-color-picker';
        this.#colorPickerElement.innerHTML = ` 
        
        <div class="maps-field">
            <div class="spectrum-map">
                <span class="transparent-bkg"></span>
                <canvas id="spectrum-canvas"></canvas>
                <button id="spectrum-cursor"></button>
            </div>
            
            <div class="hue-map">
                <canvas id="hue-canvas"></canvas>
                <button id="hue-cursor"></button>
            </div>
        </div>

        <div id="hex-field" class="hex-field">
            <label for="" class="input-label">HEX</label>
            <input type="text" id="hex-input" class="hex-input">
        </div>

        <div id="hue" class="slider">
            <label for="" class="input-label">H:</label>
            <label for="" id="hue-txt" class="input-value">360</label>
            <input id="hue-input" type="range" name="" value="0" min="0" max="360">
        </div>

        <div id="saturation" class="slider">
            <label for="" class="input-label">S:</label>
            <label for="" id="saturation-txt" class="input-value">100</label>
            <input id="saturation-input" type="range" name="" value="100" min="0" max="100">
        </div>

        <div id="vibrance" class="slider">
            <label for="" class="input-label">V:</label>
            <label for="" id="vibrance-txt" class="input-value">100</label>
            <input id="vibrance-input" type="range" name="" value="100" min="0" max="100">
        </div>

        <div id="alpha" class="slider">
            <label for="" class="input-label">ALPHA:</label>
            <label for="" id="alpha-txt" class="input-value">100</label>
            <input id="alpha-input" type="range" name="" value="100" min="0" max="100">
        </div>`;

        container.append(this.#colorPickerElement);

        //; Spectrum Map °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#spectrumMap.canvas = this.#colorPickerElement.querySelector('#spectrum-canvas');
        this.#spectrumMap.ctx = this.#spectrumMap.canvas.getContext('2d');
        this.#spectrumMap.rect = function(){return this.#spectrumMap.canvas.getBoundingClientRect()}.bind(this);
        this.#spectrumMapCursor = this.#colorPickerElement.querySelector('#spectrum-cursor');

        //; Hue Map °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#hueMap.canvas = this.#colorPickerElement.querySelector('#hue-canvas');
        this.#hueMap.ctx = this.#hueMap.canvas.getContext('2d');
        this.#hueMap.rect = function(){return this.#hueMap.canvas.getBoundingClientRect()}.bind(this);
        this.#hueMapCursor = this.#colorPickerElement.querySelector('#hue-cursor');
        
        //; Hex Field °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#hex.input = this.#colorPickerElement.querySelector('#hex-input');
        this.#hex.color = tinycolor(container.dataset.color);
        this.#hex.input.value = this.getHexColor();
        
        this.#hex.input.addEventListener("input", function(){
            this.#hexInput();
        }.bind(this));

        this.#hex.input.addEventListener("change", function(){
            
            temp = this.#hex.color.clone();
            this.#hex.color = tinycolor(this.#hex.input.value);
            
            if(this.#hex.color.isValid())
            {
                this.#hex.input.value = this.getHexColor();
            }
            else{
                this.#hex.color = temp;
                this.#hex.input.value = temp.toHex8String().toUpperCase();
            }
        
        }.bind(this));

        //; Hue Field °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#hue.input = this.#colorPickerElement.querySelector('#hue-input');
        this.#hue.txt = this.#colorPickerElement.querySelector('#hue-txt');
        this.#hue.txt.textContent = this.#hue.input.value;
        
        this.#hue.input.addEventListener("input", function(){
            this.#hueInput();
        }.bind(this));

        //; Saturation Field °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#saturation.input = this.#colorPickerElement.querySelector('#saturation-input');
        this.#saturation.txt = this.#colorPickerElement.querySelector('#saturation-txt');
        this.#saturation.txt.textContent = this.#saturation.input.value;
        
        this.#saturation.input.addEventListener("input", function(){
            this.#saturationInput();
        }.bind(this));

        //; vibrance Field °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#vibrance.input = this.#colorPickerElement.querySelector('#vibrance-input');
        this.#vibrance.txt = this.#colorPickerElement.querySelector('#vibrance-txt');
        this.#vibrance.txt.textContent = this.#vibrance.input.value;
        
        this.#vibrance.input.addEventListener("input", function(){
            this.#vibranceInput();
        }.bind(this));

        //; Alpha Field °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        this.#alpha.input = this.#colorPickerElement.querySelector('#alpha-input');
        this.#alpha.txt = this.#colorPickerElement.querySelector('#alpha-txt');
        this.#alpha.txt.textContent = this.#alpha.input.value;
        
        this.#alpha.input.addEventListener("input", function(){
            this.#alphaInput();
        }.bind(this));



        this.#syncSliders();
        this.#generateSpectrumMap(this.#hue.input.value);
        this.#generateHueMap();
        this.#spectrumMap.canvas.style.opacity = (this.#alpha.input.value/100);

        this.#syncSpectrumCursor();
        this.#syncHueCursor();

    }

    //=== FUNCTIONS ===============================================================================

    //--- Maps ---------------------------------------------------------------------------
    /* Parts of the code (logic) from https://codepen.io/SabAsan/pen/LYNgBoB?editors=0010 & https://www.youtube.com/watch?v=IjpqgFZviAo&ab_channel=SabCode */

    #generateSpectrumMap(hue)
    {
        let ctx = this.#spectrumMap.ctx;
        let width = this.#spectrumMap.canvas.width;

        ctx.clearRect(0,0, this.#spectrumMap.canvas.width, this.#spectrumMap.canvas.height);

        ctx.fillStyle = tinycolor({h:hue,s:1,l:0.5,a:1}).toHex8String();
        ctx.fillRect(0,0, this.#spectrumMap.canvas.width, this.#spectrumMap.canvas.height);

        let whiteGradient = ctx.createLinearGradient(0,0, this.#spectrumMap.canvas.width, 0)
        whiteGradient.addColorStop(0, "#fff");
        whiteGradient.addColorStop(1, "transparent");
        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0,0, this.#spectrumMap.canvas.width, this.#spectrumMap.canvas.height);

        let blackGradient = ctx.createLinearGradient(0,0, 0, this.#spectrumMap.canvas.height)
        blackGradient.addColorStop(0, "transparent");
        blackGradient.addColorStop(1, "#000");
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0,0, this.#spectrumMap.canvas.width, this.#spectrumMap.canvas.height);

        this.#spectrumMap.canvas.addEventListener('mousedown', function(e) {
            this.#sprectrumMapInput(e);
        }.bind(this));

    }

    #generateHueMap()
    {
        let ctx = this.#hueMap.ctx;
        let rect = this.#hueMap.rect();

        let hueGradient = ctx.createLinearGradient(0, 0, 0, this.#hueMap.canvas.height);
        hueGradient.addColorStop(0.00, "hsl(0, 100%, 50%)");
        hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
        hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
        hueGradient.addColorStop(0.50, "hsl(180, 100%, 50%)");
        hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
        hueGradient.addColorStop(0.83, "hsl(61.2, 100%, 50%)");
        hueGradient.addColorStop(1.00, "hsl(360, 100%, 50%)");

        ctx.fillStyle = hueGradient;
        ctx.fillRect(0, 0, this.#hueMap.canvas.width, this.#hueMap.canvas.height);

        this.#hueMap.canvas.addEventListener('mousedown', function(e) {
            this.#hueMapInput(e);
        }.bind(this));

    }

    #sprectrumMapInput(e){
        this.#getSpectrumColor(e);
        
        let spectrumInputEvent = function(e){
            this.#getSpectrumColor(e);
        }.bind(this);

        window.addEventListener('mousemove', spectrumInputEvent);

        window.addEventListener('mouseup', function(){
            window.removeEventListener('mousemove', spectrumInputEvent);
            window.addEventListener('mouseup', this);
        }.bind(this));
    }

    #hueMapInput(e){

        this.#getHueColor(e);
        
        let hueInputEvent = function(e){
            this.#getHueColor(e);
        }.bind(this);

        window.addEventListener('mousemove', hueInputEvent);

        window.addEventListener('mouseup', function(){
            window.removeEventListener('mousemove', hueInputEvent);
            window.addEventListener('mouseup', this);
        }.bind(this));
    }

    #getSpectrumColor(e){
        
        e.preventDefault();
  
        let rect = this.#spectrumMap.rect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = clamp(0,x,rect.width);
        y = clamp(0,y,rect.height);
        
        this.#vibrance.input.value = (1-(y/rect.height))*100;
        this.#vibrance.txt.textContent = this.#vibrance.input.value;
        this.#saturation.input.value = ((x/rect.width))*100;
        this.#saturation.txt.textContent = this.#saturation.input.value;
        this.#onChange()

        this.#syncHex();
        this.#syncSpectrumCursor(rect);

    }

    #getHueColor(e){
        e.preventDefault();

        let rect = this.#hueMap.rect();
        let y = e.clientY - rect.top;
        // console.log(`y: ${y} \n pageY: ${e.pageY} \n top: ${this.#hueMap.rect.top}`);
        y = clamp(0,y,rect.height);
        
        let percent = y / rect.height;
        let hue = 360 - (360 * percent);

        this.#hue.input.value = hue;
        this.#hue.txt.textContent = this.#hue.input.value;
        this.#syncHex();
        this.#onChange('hue')

        this.#generateSpectrumMap(hue);
        this.#syncHueCursor(rect);
 
    }

    #syncSpectrumCursor(rect = this.#spectrumMap.rect()) {
        
        let x = rect.width * (this.#saturation.input.value / 100);
        let y = rect.height * (1 - (this.#vibrance.input.value / 100));

        this.#spectrumMapCursor.style.left = `${x}px`;
        this.#spectrumMapCursor.style.top = `${y}px`;
    }

    #syncHueCursor(rect = this.#hueMap.rect()){

        let hue = this.#hue.input.value;
        
        let hueY = rect.height - ((hue / 360) * rect.height);
        this.#hueMapCursor.style.top = `${hueY}px`;
        
        /* if(hue != 0 && hue != 360)
        {
            console.log('here')
            let hueY = rect.height - ((hue / 360) * rect.height);
            this.#hueMapCursor.style.top = `${hueY}px`;
        }
        else if(hue === 0)
        {
            this.#hueMapCursor.style.top = `${rect.height}px`;
        }
        else{
            this.#hueMapCursor.style.top = `0`;
        } */

    }

    //--- Syncing ---------------------------------------------------------------------------

    /**
     * Creates a color picker inside the provided container
     * 
     * @param {HTMLElement} container The element where the color picker will be placed.
     * 
     * @returns nothing :)
    */
    #hexInput(){

        let temp = this.#hex.color.clone();
        this.#hex.color = tinycolor(this.#hex.input.value);
        
        if(this.#hex.color.isValid())
        {
            this.#syncSliders();
            this.#syncSpectrumCursor();
            this.#syncHueCursor();

            this.#onChange('hex')
        }
        else{
            this.#hex.color = temp;
        }

    }

    #hueInput(){

        this.#syncHex();
        this.#syncHueCursor();
        this.#generateSpectrumMap(this.#hue.input.value);
        this.#hue.txt.textContent = this.#hue.input.value;

        this.#onChange('hue')
    }

    #saturationInput(){

        this.#syncHex();
        this.#syncSpectrumCursor();
        this.#saturation.txt.textContent = this.#saturation.input.value;

        this.#onChange('saturation')
    }

    #vibranceInput(){

        this.#syncHex();
        this.#syncSpectrumCursor();
        this.#vibrance.txt.textContent = this.#vibrance.input.value;

        this.#onChange('vibrance')
    }

    #alphaInput(){

        this.#syncHex();
        this.#spectrumMap.canvas.style.opacity = (this.#alpha.input.value/100);
        this.#alpha.txt.textContent = this.#alpha.input.value;
        
        this.#onChange('alpha')
    }

    #syncSliders()
    {
        let temp = this.#hex.color.toHsv();
        
        this.#hue.input.value = temp.h;
        this.#hue.txt.textContent = this.#hue.input.value;

        this.#saturation.input.value = temp.s*100;
        this.#saturation.txt.textContent = this.#saturation.input.value;

        this.#vibrance.input.value = temp.v*100;
        this.#vibrance.txt.textContent = this.#vibrance.input.value;
        
        this.#alpha.input.value = temp.a*100;
        this.#alpha.txt.textContent = this.#alpha.input.value;

    }

    #syncHex(){

        this.#hex.color = tinycolor({   h:this.#hue.input.value,
                                        s: this.#saturation.input.value/100,
                                        v:this.#vibrance.input.value/100,
                                        a:this.#alpha.input.value/100
                                    });

        this.#hex.input.value = this.getHexColor();
    }

    onRevealFunc(){
        this.#syncHueCursor()
        this.#syncSpectrumCursor();
    }

    //--- Get & Set ---------------------------------------------------------------------------

    /**
     * Returns the tinycolor object that holds the color of the picker
     * 
     * https://github.com/bgrins/TinyColor
     * 
     * @returns {tinycolor} A clone of the tinycolor obj used in the color picker
    */
    getTinyColor(){
        return this.#hex.color.clone();
    }

    /**
     * Returns the hex code of color in the picker
     * 
     * @returns {String} Hex8 string
    */
    getHexColor(){
        return this.#hex.color.toHex8String().toUpperCase();
    }

    /**
     * Returns the color value in the picker
     * 
     * @returns {String} Hex8 string
    */
    getColor(){
        return this.#hex.color.toHex8String().toUpperCase();
    }

    //--- On Change Events ---------------------------------------------------------------------------

    #onChange(type){
        if(this.exist(this.#onChangeEvent))
        {
            if(!this.exist(type))
            {
                type = 'any';
            }

            this.#onChangeEvent(type);
        }
    }

    set onChangeEvent(callback)
    {
        if(isValidFunction(callback))
        {
            this.#onChangeEvent = callback;
        }
        else{
            throw new Error('The passed callback must be a function');
        }
    }

    //--- Utility ---------------------------------------------------------------------------

    /**
     * Returns true if the given value is neither **undefined** nor **null**
     * 
     * @param {Object} value Any kind of letiable
     * 
     * @returns {boolean} boolean
    */
    exist(value)
    {
        return (typeof value !== 'undefined' && value !== null);
    }

    //--- Other Functions ---------------------------------------------------------------------------

}

//! === TINYCOLOR LIBRARY ===============================================================================
//. https://github.com/bgrins/TinyColor
//. Brian Grinstead, MIT License

function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var trimLeft=/^\s+/,trimRight=/\s+$/;function tinycolor(t,r){if(r=r||{},(t=t||"")instanceof tinycolor)return t;if(!(this instanceof tinycolor))return new tinycolor(t,r);var n=inputToRGB(t);this._originalInput=t,this._r=n.r,this._g=n.g,this._b=n.b,this._a=n.a,this._roundA=Math.round(100*this._a)/100,this._format=r.format||n.format,this._gradientType=r.gradientType,this._r<1&&(this._r=Math.round(this._r)),this._g<1&&(this._g=Math.round(this._g)),this._b<1&&(this._b=Math.round(this._b)),this._ok=n.ok}function inputToRGB(t){var r={r:0,g:0,b:0},n=1,e=null,o=null,i=null,a=!1,s=!1;return"string"==typeof t&&(t=stringInputToObject(t)),"object"==_typeof(t)&&(isValidCSSUnit(t.r)&&isValidCSSUnit(t.g)&&isValidCSSUnit(t.b)?(r=rgbToRgb(t.r,t.g,t.b),a=!0,s="%"===String(t.r).substr(-1)?"prgb":"rgb"):isValidCSSUnit(t.h)&&isValidCSSUnit(t.s)&&isValidCSSUnit(t.v)?(e=convertToPercentage(t.s),o=convertToPercentage(t.v),r=hsvToRgb(t.h,e,o),a=!0,s="hsv"):isValidCSSUnit(t.h)&&isValidCSSUnit(t.s)&&isValidCSSUnit(t.l)&&(e=convertToPercentage(t.s),i=convertToPercentage(t.l),r=hslToRgb(t.h,e,i),a=!0,s="hsl"),t.hasOwnProperty("a")&&(n=t.a)),n=boundAlpha(n),{ok:a,format:t.format||s,r:Math.min(255,Math.max(r.r,0)),g:Math.min(255,Math.max(r.g,0)),b:Math.min(255,Math.max(r.b,0)),a:n}}function rgbToRgb(t,r,n){return{r:255*bound01(t,255),g:255*bound01(r,255),b:255*bound01(n,255)}}function rgbToHsl(t,r,n){t=bound01(t,255),r=bound01(r,255),n=bound01(n,255);var e,o,i=Math.max(t,r,n),a=Math.min(t,r,n),s=(i+a)/2;if(i==a)e=o=0;else{var $=i-a;switch(o=s>.5?$/(2-i-a):$/(i+a),i){case t:e=(r-n)/$+(r<n?6:0);break;case r:e=(n-t)/$+2;break;case n:e=(t-r)/$+4}e/=6}return{h:e,s:o,l:s}}function hslToRgb(t,r,n){var e,o,i;function a(t,r,n){return(n<0&&(n+=1),n>1&&(n-=1),n<1/6)?t+(r-t)*6*n:n<.5?r:n<2/3?t+(r-t)*(2/3-n)*6:t}if(t=bound01(t,360),r=bound01(r,100),n=bound01(n,100),0===r)e=o=i=n;else{var s=n<.5?n*(1+r):n+r-n*r,$=2*n-s;e=a($,s,t+1/3),o=a($,s,t),i=a($,s,t-1/3)}return{r:255*e,g:255*o,b:255*i}}function rgbToHsv(t,r,n){t=bound01(t,255),r=bound01(r,255),n=bound01(n,255);var e,o,i=Math.max(t,r,n),a=Math.min(t,r,n),s=i-a;if(o=0===i?0:s/i,i==a)e=0;else{switch(i){case t:e=(r-n)/s+(r<n?6:0);break;case r:e=(n-t)/s+2;break;case n:e=(t-r)/s+4}e/=6}return{h:e,s:o,v:i}}function hsvToRgb(t,r,n){t=6*bound01(t,360),r=bound01(r,100),n=bound01(n,100);var e=Math.floor(t),o=t-e,i=n*(1-r),a=n*(1-o*r),s=n*(1-(1-o)*r),$=e%6,l=[n,a,i,i,s,n][$],c=[s,n,n,a,i,i][$],u=[i,i,s,n,n,a][$];return{r:255*l,g:255*c,b:255*u}}function rgbToHex(t,r,n,e){var o=[pad2(Math.round(t).toString(16)),pad2(Math.round(r).toString(16)),pad2(Math.round(n).toString(16))];return e&&o[0].charAt(0)==o[0].charAt(1)&&o[1].charAt(0)==o[1].charAt(1)&&o[2].charAt(0)==o[2].charAt(1)?o[0].charAt(0)+o[1].charAt(0)+o[2].charAt(0):o.join("")}function rgbaToHex(t,r,n,e,o){var i=[pad2(Math.round(t).toString(16)),pad2(Math.round(r).toString(16)),pad2(Math.round(n).toString(16)),pad2(convertDecimalToHex(e))];return o&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)&&i[3].charAt(0)==i[3].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0)+i[3].charAt(0):i.join("")}function rgbaToArgbHex(t,r,n,e){return[pad2(convertDecimalToHex(e)),pad2(Math.round(t).toString(16)),pad2(Math.round(r).toString(16)),pad2(Math.round(n).toString(16))].join("")}function _desaturate(t,r){r=0===r?0:r||10;var n=tinycolor(t).toHsl();return n.s-=r/100,n.s=clamp01(n.s),tinycolor(n)}function _saturate(t,r){r=0===r?0:r||10;var n=tinycolor(t).toHsl();return n.s+=r/100,n.s=clamp01(n.s),tinycolor(n)}function _greyscale(t){return tinycolor(t).desaturate(100)}function _lighten(t,r){r=0===r?0:r||10;var n=tinycolor(t).toHsl();return n.l+=r/100,n.l=clamp01(n.l),tinycolor(n)}function _brighten(t,r){r=0===r?0:r||10;var n=tinycolor(t).toRgb();return n.r=Math.max(0,Math.min(255,n.r-Math.round(-(255*(r/100))))),n.g=Math.max(0,Math.min(255,n.g-Math.round(-(255*(r/100))))),n.b=Math.max(0,Math.min(255,n.b-Math.round(-(255*(r/100))))),tinycolor(n)}function _darken(t,r){r=0===r?0:r||10;var n=tinycolor(t).toHsl();return n.l-=r/100,n.l=clamp01(n.l),tinycolor(n)}function _spin(t,r){var n=tinycolor(t).toHsl(),e=(n.h+r)%360;return n.h=e<0?360+e:e,tinycolor(n)}function _complement(t){var r=tinycolor(t).toHsl();return r.h=(r.h+180)%360,tinycolor(r)}function polyad(t,r){if(isNaN(r)||r<=0)throw Error("Argument to polyad must be a positive number");for(var n=tinycolor(t).toHsl(),e=[tinycolor(t)],o=360/r,i=1;i<r;i++)e.push(tinycolor({h:(n.h+i*o)%360,s:n.s,l:n.l}));return e}function _splitcomplement(t){var r=tinycolor(t).toHsl(),n=r.h;return[tinycolor(t),tinycolor({h:(n+72)%360,s:r.s,l:r.l}),tinycolor({h:(n+216)%360,s:r.s,l:r.l})]}function _analogous(t,r,n){r=r||6,n=n||30;var e=tinycolor(t).toHsl(),o=360/n,i=[tinycolor(t)];for(e.h=(e.h-(o*r>>1)+720)%360;--r;)e.h=(e.h+o)%360,i.push(tinycolor(e));return i}function _monochromatic(t,r){r=r||6;for(var n=tinycolor(t).toHsv(),e=n.h,o=n.s,i=n.v,a=[],s=1/r;r--;)a.push(tinycolor({h:e,s:o,v:i})),i=(i+s)%1;return a}tinycolor.prototype={isDark:function t(){return 128>this.getBrightness()},isLight:function t(){return!this.isDark()},isValid:function t(){return this._ok},getOriginalInput:function t(){return this._originalInput},getFormat:function t(){return this._format},getAlpha:function t(){return this._a},getBrightness:function t(){var r=this.toRgb();return(299*r.r+587*r.g+114*r.b)/1e3},getLuminance:function t(){var r,n,e,o,i,a,s=this.toRgb();return r=s.r/255,n=s.g/255,e=s.b/255,o=r<=.03928?r/12.92:Math.pow((r+.055)/1.055,2.4),.2126*o+.7152*(i=n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4))+.0722*(a=e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4))},setAlpha:function t(r){return this._a=boundAlpha(r),this._roundA=Math.round(100*this._a)/100,this},toHsv:function t(){var r=rgbToHsv(this._r,this._g,this._b);return{h:360*r.h,s:r.s,v:r.v,a:this._a}},toHsvString:function t(){var r=rgbToHsv(this._r,this._g,this._b),n=Math.round(360*r.h),e=Math.round(100*r.s),o=Math.round(100*r.v);return 1==this._a?"hsv("+n+", "+e+"%, "+o+"%)":"hsva("+n+", "+e+"%, "+o+"%, "+this._roundA+")"},toHsl:function t(){var r=rgbToHsl(this._r,this._g,this._b);return{h:360*r.h,s:r.s,l:r.l,a:this._a}},toHslString:function t(){var r=rgbToHsl(this._r,this._g,this._b),n=Math.round(360*r.h),e=Math.round(100*r.s),o=Math.round(100*r.l);return 1==this._a?"hsl("+n+", "+e+"%, "+o+"%)":"hsla("+n+", "+e+"%, "+o+"%, "+this._roundA+")"},toHex:function t(r){return rgbToHex(this._r,this._g,this._b,r)},toHexString:function t(r){return"#"+this.toHex(r)},toHex8:function t(r){return rgbaToHex(this._r,this._g,this._b,this._a,r)},toHex8String:function t(r){return"#"+this.toHex8(r)},toRgb:function t(){return{r:Math.round(this._r),g:Math.round(this._g),b:Math.round(this._b),a:this._a}},toRgbString:function t(){return 1==this._a?"rgb("+Math.round(this._r)+", "+Math.round(this._g)+", "+Math.round(this._b)+")":"rgba("+Math.round(this._r)+", "+Math.round(this._g)+", "+Math.round(this._b)+", "+this._roundA+")"},toPercentageRgb:function t(){return{r:Math.round(100*bound01(this._r,255))+"%",g:Math.round(100*bound01(this._g,255))+"%",b:Math.round(100*bound01(this._b,255))+"%",a:this._a}},toPercentageRgbString:function t(){return 1==this._a?"rgb("+Math.round(100*bound01(this._r,255))+"%, "+Math.round(100*bound01(this._g,255))+"%, "+Math.round(100*bound01(this._b,255))+"%)":"rgba("+Math.round(100*bound01(this._r,255))+"%, "+Math.round(100*bound01(this._g,255))+"%, "+Math.round(100*bound01(this._b,255))+"%, "+this._roundA+")"},toName:function t(){return 0===this._a?"transparent":!(this._a<1)&&!!hexNames[rgbToHex(this._r,this._g,this._b,!0)]},toFilter:function t(r){var n="#"+rgbaToArgbHex(this._r,this._g,this._b,this._a),e=n,o=this._gradientType?"GradientType = 1, ":"";if(r){var i=tinycolor(r);e="#"+rgbaToArgbHex(i._r,i._g,i._b,i._a)}return"progid:DXImageTransform.Microsoft.gradient("+o+"startColorstr="+n+",endColorstr="+e+")"},toString:function t(r){var n=!!r;r=r||this._format;var e=!1,o=this._a<1&&this._a>=0;return!n&&o&&("hex"===r||"hex6"===r||"hex3"===r||"hex4"===r||"hex8"===r||"name"===r)?"name"===r&&0===this._a?this.toName():this.toRgbString():("rgb"===r&&(e=this.toRgbString()),"prgb"===r&&(e=this.toPercentageRgbString()),("hex"===r||"hex6"===r)&&(e=this.toHexString()),"hex3"===r&&(e=this.toHexString(!0)),"hex4"===r&&(e=this.toHex8String(!0)),"hex8"===r&&(e=this.toHex8String()),"name"===r&&(e=this.toName()),"hsl"===r&&(e=this.toHslString()),"hsv"===r&&(e=this.toHsvString()),e||this.toHexString())},clone:function t(){return tinycolor(this.toString())},_applyModification:function t(r,n){var e=r.apply(null,[this].concat([].slice.call(n)));return this._r=e._r,this._g=e._g,this._b=e._b,this.setAlpha(e._a),this},lighten:function t(){return this._applyModification(_lighten,arguments)},brighten:function t(){return this._applyModification(_brighten,arguments)},darken:function t(){return this._applyModification(_darken,arguments)},desaturate:function t(){return this._applyModification(_desaturate,arguments)},saturate:function t(){return this._applyModification(_saturate,arguments)},greyscale:function t(){return this._applyModification(_greyscale,arguments)},spin:function t(){return this._applyModification(_spin,arguments)},_applyCombination:function t(r,n){return r.apply(null,[this].concat([].slice.call(n)))},analogous:function t(){return this._applyCombination(_analogous,arguments)},complement:function t(){return this._applyCombination(_complement,arguments)},monochromatic:function t(){return this._applyCombination(_monochromatic,arguments)},splitcomplement:function t(){return this._applyCombination(_splitcomplement,arguments)},triad:function t(){return this._applyCombination(polyad,[3])},tetrad:function t(){return this._applyCombination(polyad,[4])}},tinycolor.fromRatio=function(t,r){if("object"==_typeof(t)){var n={};for(var e in t)t.hasOwnProperty(e)&&("a"===e?n[e]=t[e]:n[e]=convertToPercentage(t[e]));t=n}return tinycolor(t,r)},tinycolor.equals=function(t,r){return!!t&&!!r&&tinycolor(t).toRgbString()==tinycolor(r).toRgbString()},tinycolor.random=function(){return tinycolor.fromRatio({r:Math.random(),g:Math.random(),b:Math.random()})},tinycolor.mix=function(t,r,n){n=0===n?0:n||50;var e=tinycolor(t).toRgb(),o=tinycolor(r).toRgb(),i=n/100;return tinycolor({r:(o.r-e.r)*i+e.r,g:(o.g-e.g)*i+e.g,b:(o.b-e.b)*i+e.b,a:(o.a-e.a)*i+e.a})},tinycolor.readability=function(t,r){var n=tinycolor(t),e=tinycolor(r);return(Math.max(n.getLuminance(),e.getLuminance())+.05)/(Math.min(n.getLuminance(),e.getLuminance())+.05)},tinycolor.isReadable=function(t,r,n){var e,o,i=tinycolor.readability(t,r);switch(o=!1,(e=validateWCAG2Parms(n)).level+e.size){case"AAsmall":case"AAAlarge":o=i>=4.5;break;case"AAlarge":o=i>=3;break;case"AAAsmall":o=i>=7}return o},tinycolor.mostReadable=function(t,r,n){var e,o,i,a,s=null,$=0;o=(n=n||{}).includeFallbackColors,i=n.level,a=n.size;for(var l=0;l<r.length;l++)(e=tinycolor.readability(t,r[l]))>$&&($=e,s=tinycolor(r[l]));return tinycolor.isReadable(t,s,{level:i,size:a})||!o?s:(n.includeFallbackColors=!1,tinycolor.mostReadable(t,["#fff","#000"],n))};var names=tinycolor.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},hexNames=tinycolor.hexNames=flip(names);function flip(t){var r={};for(var n in t)t.hasOwnProperty(n)&&(r[t[n]]=n);return r}function boundAlpha(t){return(isNaN(t=parseFloat(t))||t<0||t>1)&&(t=1),t}function bound01(t,r){isOnePointZero(t)&&(t="100%");var n=isPercentage(t);return(t=Math.min(r,Math.max(0,parseFloat(t))),n&&(t=parseInt(t*r,10)/100),1e-6>Math.abs(t-r))?1:t%r/parseFloat(r)}function clamp01(t){return Math.min(1,Math.max(0,t))}function parseIntFromHex(t){return parseInt(t,16)}function isOnePointZero(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)}function isPercentage(t){return"string"==typeof t&&-1!=t.indexOf("%")}function pad2(t){return 1==t.length?"0"+t:""+t}function convertToPercentage(t){return t<=1&&(t=100*t+"%"),t}function convertDecimalToHex(t){return Math.round(255*parseFloat(t)).toString(16)}function convertHexToDecimal(t){return parseIntFromHex(t)/255}var matchers=function(){var t="(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)",r="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?",n="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?";return{CSS_UNIT:RegExp(t),rgb:RegExp("rgb"+r),rgba:RegExp("rgba"+n),hsl:RegExp("hsl"+r),hsla:RegExp("hsla"+n),hsv:RegExp("hsv"+r),hsva:RegExp("hsva"+n),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();function isValidCSSUnit(t){return!!matchers.CSS_UNIT.exec(t)}function stringInputToObject(t){t=t.replace(trimLeft,"").replace(trimRight,"").toLowerCase();var r,n=!1;if(names[t])t=names[t],n=!0;else if("transparent"==t)return{r:0,g:0,b:0,a:0,format:"name"};return(r=matchers.rgb.exec(t))?{r:r[1],g:r[2],b:r[3]}:(r=matchers.rgba.exec(t))?{r:r[1],g:r[2],b:r[3],a:r[4]}:(r=matchers.hsl.exec(t))?{h:r[1],s:r[2],l:r[3]}:(r=matchers.hsla.exec(t))?{h:r[1],s:r[2],l:r[3],a:r[4]}:(r=matchers.hsv.exec(t))?{h:r[1],s:r[2],v:r[3]}:(r=matchers.hsva.exec(t))?{h:r[1],s:r[2],v:r[3],a:r[4]}:(r=matchers.hex8.exec(t))?{r:parseIntFromHex(r[1]),g:parseIntFromHex(r[2]),b:parseIntFromHex(r[3]),a:convertHexToDecimal(r[4]),format:n?"name":"hex8"}:(r=matchers.hex6.exec(t))?{r:parseIntFromHex(r[1]),g:parseIntFromHex(r[2]),b:parseIntFromHex(r[3]),format:n?"name":"hex"}:(r=matchers.hex4.exec(t))?{r:parseIntFromHex(r[1]+""+r[1]),g:parseIntFromHex(r[2]+""+r[2]),b:parseIntFromHex(r[3]+""+r[3]),a:convertHexToDecimal(r[4]+""+r[4]),format:n?"name":"hex8"}:!!(r=matchers.hex3.exec(t))&&{r:parseIntFromHex(r[1]+""+r[1]),g:parseIntFromHex(r[2]+""+r[2]),b:parseIntFromHex(r[3]+""+r[3]),format:n?"name":"hex"}}function validateWCAG2Parms(t){var r,n;return r=((t=t||{level:"AA",size:"small"}).level||"AA").toUpperCase(),n=(t.size||"small").toLowerCase(),"AA"!==r&&"AAA"!==r&&(r="AA"),"small"!==n&&"large"!==n&&(n="small"),{level:r,size:n}}export{tinycolor};