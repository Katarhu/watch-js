import  CONSTANTS from "./constants.js";

/**
* @typedef ICurrentTime
* @type { object }
* @property {number} hours
* @property {number} minutes
* @property {number} seconds
*/

const MAXIMUM_DEGREES = 360;
const ONE_SECOND_IN_MS = 1000;

const SECONDS_LIMIT = 60;
const MINUTES_LIMIT = 60;
const HOURS_LIMIT = 12;

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_HALF_DAY = 3600 * 12;


export default class Watch {
    /**
     * @type {HTMLElement | null}
     */
    $container;
    /**
     * @type {HTMLElement | null}
     */
    $hoursLine;
    /**
     * @type {HTMLElement | null}
     */
    $minutesLine;
    /**
     * @type {HTMLElement | null}
     */
    $secondsLine;
    /**
     * @type {HTMLElement | null}
     */
    isMounted;
    /**
     * @type {ICurrentTime}
     */
    currentTime = {
        hours: 0,
        minutes: 0,
        seconds: 0
    };
    /**
     * @type {number} INTERVAL ID
     */
    interval;
    /**
     * @type {number} 
     */
    secondTillStart = 0;


    constructor() {
        this.setCurrentTime( new Date() );       
    }

    /** 
    * @param {HTMLElement} $container 
    * @returns {Watch}
    */
    appendWatch($container) {

        if( this.isMounted ) throw new Error("Watch is already mounted");

        const watchHtml = 
        `
        <div class="${CONSTANTS.containerClassName}" ${CONSTANTS.containerDataAttribute}>
            <div class="${CONSTANTS.dotClassName}"></div>
            <div class="${CONSTANTS.hoursLineClassName}" ${CONSTANTS.hoursLineDataAttribute} ></div>
            <div class="${CONSTANTS.minutesLineClassName}" ${CONSTANTS.minutesLineDataAttribute} ></div>
            <div class="${CONSTANTS.secondsLineClassName}" ${CONSTANTS.secondsLineDataAttribute} ></div>
        </div>
        `

        $container.insertAdjacentHTML('beforeend', watchHtml);
        this.isMounted = true;

        this.#parseElements();
        this.#setInitialLinesDegrees();

        return this;
    }

    /** 
    * @param {Date | string} date
    * @returns {Watch}
    */

    setCurrentTime(date) {
        if( !date ) throw new Error("Date should be provided");


        if( date instanceof Date ) {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();

            minutes = minutes * SECONDS_IN_MINUTE + seconds;
            hours = hours * SECONDS_IN_HOUR + minutes;

            this.currentTime = {
                hours,
                minutes,
                seconds
            }

            if( this.isMounted ) this.#setInitialLinesDegrees();
            
            return this;
        }
        
        if( typeof date === "string") {
            if( !CONSTANTS.timeRegexp.test(date.trim()) ) throw new Error("Time should be in format hh:mm:ss");
            
            let [hours, minutes, seconds] = date.split(":");
            
            seconds = +seconds;
            minutes = +minutes * SECONDS_IN_MINUTE + seconds;
            hours = (+hours % HOURS_LIMIT) * SECONDS_IN_HOUR + minutes;

            this.currentTime = {
                hours,
                minutes,
                seconds
            }

            if( this.isMounted ) this.#setInitialLinesDegrees();

            return this;
        }


        throw new Error('Date type should be either Date or string');
    }

     /**
     * @returns {Watch}
     */
     start() {
        if( !this.isMounted ) throw new Error("Watch wasn\'t mounted");
        
        this.interval = setInterval(() => {
            this.#calculateLinesDegrees();
        }, ONE_SECOND_IN_MS)

        return this;
    }

    /**
     * @returns {Watch}
    */
    stop() {
       if( !this.isMounted ) throw new Error("Watch wasn\'t mounted");

        clearInterval(this.interval);

        return this;
    }


    #parseElements()  {
        this.$container = document.querySelector(`[${CONSTANTS.containerDataAttribute}]`);
        this.$hoursLine = document.querySelector(`[${CONSTANTS.hoursLineDataAttribute}]`);
        this.$minutesLine = document.querySelector(`[${CONSTANTS.minutesLineDataAttribute}]`);
        this.$secondsLine = document.querySelector(`[${CONSTANTS.secondsLineDataAttribute}]`);
    }
    

    #setInitialLinesDegrees() {
        let {hours, minutes, seconds} = this.currentTime;

        this.secondTillStart = seconds;

        const secondsLineDegrees = this.#calculateDegrees(seconds, SECONDS_IN_MINUTE);
        this.#setNewLineDegree(this.$secondsLine, secondsLineDegrees);

        const minutesLineDegrees = this.#calculateDegrees(minutes, SECONDS_IN_HOUR);
        this.#setNewLineDegree(this.$minutesLine, minutesLineDegrees);

        const hoursLineDegrees = this.#calculateDegrees(hours, SECONDS_IN_HALF_DAY);
        this.#setNewLineDegree(this.$hoursLine, hoursLineDegrees);
    }

    #calculateLinesDegrees() {
        this.secondTillStart += 1;

        let {hours, minutes, seconds} = this.currentTime;

        seconds += 1;

        if( seconds >= SECONDS_IN_MINUTE ) seconds = 0;

        const secondsLineDegrees = this.#calculateDegrees(seconds, SECONDS_IN_MINUTE);
        this.#setNewLineDegree(this.$secondsLine, secondsLineDegrees);


        minutes += 1;

        if( minutes >= SECONDS_IN_HOUR ) minutes = 0;

        const minutesLineDegrees = this.#calculateDegrees(minutes, SECONDS_IN_HOUR);
        this.#setNewLineDegree(this.$minutesLine, minutesLineDegrees);

        hours += 1;

        if( hours >= SECONDS_IN_HALF_DAY ) hours = 0;

        const hoursLineDegrees = this.#calculateDegrees(hours, SECONDS_IN_HALF_DAY);
        this.#setNewLineDegree(this.$hoursLine, hoursLineDegrees);


        this.currentTime = {
            hours,
            minutes,
            seconds
        }
    }

    /**
     * @param {HTMLElement} $line
     * @param {number} degrees
     * @returns {void}
     */

    #setNewLineDegree($line, degrees) {
        $line.style.setProperty("--rotate", `rotate(${degrees}deg)`);
    }

    /**
     * 
     * @param {number} current
     * @param {number} limit
     * @returns {number}
     */

    #calculateDegrees(current, limit) {
        const degreesPerUnit = MAXIMUM_DEGREES / limit;

        return degreesPerUnit * current; 
    }
}