    
    //=== CLASSES ===============================================================================
    
    export class TimeTracker
    {
        #startTime;
        #endTime;
        message
        precision;

        constructor(){
            this.#startTime = 0;
            this.#endTime = 0;
            this.message = '';
            this.precision = 5;
        }

        start()
        {
            this.#startTime = performance.now();
        }

        end()
        {
            this.#endTime = performance.now();
        }

        log()
        {
            if(this.message.match(/\$result/))
            {
                this.message = this.message.replace(/\$result/g,(this.result()+'ms'));
                console.log(this.message);
            }
            else{
                console.log(this.message + this.result() + "ms");
            }
            
        }

        result()
        {
            if(this.#endTime != 0)
            {
                return toFixed((this.#endTime - this.#startTime), this.precision, true)
            }

            return undefined;
        }

        reset()
        {
            this.#startTime = 0;
            this.#endTime = 0;
            this.message = '';
            this.precision = 5;
        }
    }


    //=== VARIABLES ===============================================================================

    //=== FUNCTIONS ===============================================================================

    //--- Other ---------------------------------------------------------------------------

    export function numberToAlphabet(number) 
    {
        if (number >= 0 && number <= 26) 
        {
            return String.fromCharCode(65 + number);
        } 
        else 
        {
            return "?";
        }
    }

    export function isValidFunction(func) //^ Returns true only if the passed value is a function
    {
        if(!exist(func))
        {
            console.warn("The passed function is invalid (results null undefined)");
            return false;
        }

        if(!(typeof func === 'function'))
        {
            console.warn("Func must be a function, be sure to pass a function");
            return false;
        }

        return true;
    }

    export function isValidPropertyName(name) //^ Returns true only if the passed value could be a valid property/variable name
    {
        /*
        ? THE CONDITIONS IN ORDER TO RETURN TRUE:

        ;   name has to be a string
        ;   name length must be greater than 0
        ;   name can't contain any number
        ;   name can't contain any symbol beside "_" and "-"
        ;   the symbols "_" and "-" can't be placed at the beginning or the end of the name
        */

        if(!(typeof name === 'string'))
        {
            console.warn("The passed property needs to be a string");
            return false;
        }

        //? This regex checks if the property contains any invalid character, 
        //? the !! simply allow us to check if the result is null or not 
        if(!!(name.match(/(^[_-]|[_-]$)|[^a-zA-Z_-]/)) && name.length <= 0) 
        {
            console.warn("The given property name isn't valid, you cant use any symbol or number in your property name (except: - and _)");
            return false;
        }
        
        return true;
    }

    export function toFixed(value,precision,useRound) //^ Similar to the toFixed function but it provides a number and not a string representation of it
    {
        
        let negative = (value<0);
        
        value = Math.abs(value);
        
        let fixer = Math.pow(10,precision);

        if(!useRound)
        {
            value = Math.floor(value * fixer) / fixer; 
        }
        else{     
            value = Math.round(value * fixer) / fixer;
        }
    
        return (negative ? (-value) : value);
        
    }

    export function randNum(min,max) //^ Generates a random number with math random but fixes the input (ex: randNum(1,4) --> 1/2/3/4) [Xavier]
    {
        if(isNaN(min) || isNaN(max))
        {
            throw new Error("min or max is NaN");
        }
        if(min == max)
        {
            return max;
        }
        return ((Math.random() * ((max+1)-min)) + min);
    }

    export function getTime(separator) //^ Returns the current time in the format of hours(separator)minutes(separator)seconds. [separator must be a string/char] [Xavier]
    {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        return (parseInt(hours) + separator + parseInt(minutes) + separator + parseInt(seconds));
    }

    export function percentage(value, percentage) //^ Calculates the percentage of a given value [ex: percentage(200,20) returns 40] [Xavier]
    {
        if(value == 0)
        {
            return 0;
        }

        return ((value/100.0)*percentage);
    }

    export function findPercentage(value, percentage) //^ [ex: findPercentage(200,40) returns 20] if you have two values you can find the percentual difference between them [Xavier]
    {
        if(value == 0)
        {
            return 0;
        }

        return (percentage/(value/100.0));
    }

    export function clamp(min, value, max) //^ Clamps the input values to the given boundaries (note that if one of the boundaries results to be NaN it will be ignored) [Xavier]
    {
        if(isNaN(min) && isNaN(max))
        {
            return value;
        }
        if(value >= max && !isNaN(max))
        {
            return max;
        }
        if(value <= min && !isNaN(min))
        {
            return min;
        }
        
        return value;
    }

    export function exist(value)
    {
        return (typeof value !== 'undefined' && value !== null);
    }

    export function invertBool(bool)
    {
        return (bool == true ? false : true);
    }

    export function sendFileDownload(data, fileName, atRemoveCallBack = null)
    {
        const blob = new Blob([data], {type: "octet-stream"});
        const href = URL.createObjectURL(blob);

        const a = document.createElement('a');
        setAttributes(a,{href,style:"display:none", download: fileName})
        
        document.body.appendChild(a);
        a.click();
        
        let timeOut = setTimeout(()=>{
            URL.revokeObjectURL(href);
            a.remove();
            if(exist(atRemoveCallBack))
            {
                atRemoveCallBack();
            }
            clearTimeout(timeOut);
        }, 300)

    }

    export function setAttributes(el, attrs){ //? from https://stackoverflow.com/a/12274886/20015615
        Object.keys(attrs)
        .filter(key => el[key] !== undefined)
        .forEach(key =>
        typeof attrs[key] === 'object'
            ? Object.keys(attrs[key])
                .forEach(innerKey => el[key][innerKey] = attrs[key][innerKey])
            : el[key] = attrs[key]
        );
    }