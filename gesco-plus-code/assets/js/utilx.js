    
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

    export function getJSON(filePath) { //^ Get JSON file content from file

        const request = new XMLHttpRequest();
        request.open('GET', filePath, false); //? The third parameter sets the request to be synchronous
        request.send();
    
        if (request.status === 200) {
            return JSON.parse(request.responseText);
        } else {
            throw new Error(`Failed to load JSON file from ${filePath}`);
        }
    }

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

    export function explodeString(str){
        return str.split('');
    }

    /**
     * replaceInsideStr() takes a string and with a pattern it replaces an precise pattern and a variable
     * @param str: the string to modify
     * @param pattern a RegEx pattern were the funcition will replace the (.*?) replacement
     * @param replacement the string that will used to replace
     * @returns String
     */
    export function replaceInsideStr(str,pattern, replacement){

        let match = str.match(new RegExp(pattern,'g'))[0];

        replacement = pattern.replace(/\(\.\*\?\)/g,replacement);
        
        return str.replace(new RegExp(match,'g'), replacement);

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

    export function toFixed(value,precision,useRound = true) //^ Similar to the toFixed function but it provides a number and not a string representation of it
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
        return Math.floor((Math.random() * ((max+1)-min)) + min);
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
        return (!bool);
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

    export function elFromHtml(html){
        // document.createRange().createContextualFragment("...").firstElementChild
        let template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstElementChild;
    }

/**
 * Formats value like this -> Performance:  (perf)ms
 * @param perf: double that holds time value in ms
 * @param precision default set to 3, the perf value will be fixed the passed precision
 * @returns String
 */
export function perfLogToString(perf, precision = 3)
{
	return ("Performance:  " + toFixed(ms, precision) + "ms");
}

/**
 * Does a single loop and checks how much time it takes for the passed function to be executed.
 * It uses performance.now();
 * @param {*} func The function to test
 * @param {number} iterations How many time the func will be tested
 * @param {boolean} cntLog Default false, set to true it will log the iterations counter
 * @returns {number} The avarage of all records
*/
export function perfTest(func,iterations, cntLog = false){
	let perfs = [];
	let time;
	let bigTime = performance.now();
	
	let cnt = 0;
	while(cnt < iterations)
	{
		time = performance.now();
		func();
		perfs.push(performance.now()-time);
		cnt++;
		if(cntLog) console.log(`${cnt}/${iterations}`);
	}
	bigTime = (performance.now()-bigTime)/iterations;
	
	time = perfs.reduce((a, b) => (a + b)) / iterations;
	time = (time+bigTime)/2.0;
	
	return time;
}

/**
 * A more precise way to check the performance of a function
 * @param {*} func The function to test
 * @param {number} iterations How many time the func will be tested x sample
 * @param {number} samples How many times the perfTest will be called
 * @returns {number} The avarage of all records
*/
export function multiPerfTest(func, iterations, samples){
	let perfs = [];
	let time = performance.now();
	
	let cnt = 0;
	while(cnt < samples)
	{
		perfs.push(perfTest(func, iterations));
		cnt++;
	}
	
	time = (performance.now()-time)/(samples*iterations);
	perfs = perfs.reduce((a, b) => (a + b)) / samples;
	
	time = (time+perfs)/2.0;
	
	return time;
}