import {Utility} from '../Utility.js';


export default class Detectors{
    constructor(path) {
        this.detectors = Utility.loadDetectors(path);
    }
}