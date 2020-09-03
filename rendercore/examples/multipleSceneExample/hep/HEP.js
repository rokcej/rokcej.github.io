/**
 * Global namespace for HEP.
 *
 * @namespace
 */
import * as RC from '../../../src/RenderCore.js';


export const HEP = {
    params: {
        visibleGeometry: true,
        MSAA: false,

        XYcutPlaneOffset: 0.0,
        ZcutPlaneOffset: 0.0,

        visibleBeamPipe: true,
        colorBeamPipe: 0x282828,
        ecolorBeamPipe: 0x50505,
        opacityBeamPipe: 0.16,

        visiblePix: true,
        //colorPix: 0x119911,
        colorPix: 0xb3f1ff,
        ecolorPix: 0x1eff,
        //opacityPix: 0.15,
        opacityPix: 0.04,

        visiblePST: true,
        //colorPST: 0x555555,
        colorPST: 0x464646,
        ecolorPST: 0x0,
        opacityPST: 0.13,

        visibleSStrip: true,
        //colorSStrip: 0x111199,
        colorSStrip: 0x1424a,
        ecolorSStrip: 0x2a2a2a,
        opacitySStrip: 0.08,

        visibleLStrip: true,
        colorLStrip: 0x8e8d8d,
        ecolorLStrip: 0x343434,
        opacityLStrip: 0.07,

        lightIntensity: 1.0,

        //visibleHits: true,
        //hitOpacity: 0.5,
        //hitDefaultColor: 0xffffff,
        //hitPointSize: 2.0,
        //hitProperty: false,
        ///eventID: 0,

        //visibleTracks: true,

        //test: 1.0,


        visibleParticles: true,
        particlesSize: 3.0,
        particlesColor: 0xffffff,
        opacityParticles: 1.0,
        particlesColorType: 1,

        visibleHits: true,
        hitsSize: 1.3,
        hitsColor: 0x996699,
        opacityHits: 0.5,
        hitsColorType: 0,

        visibleTracks: true,
        tracksSize: 1.0,
        tracksColor: 0xff0000,
        submittedTracksColor: 0xf0ffff,
        opacityTracks: 0.04,
        tracksColorType: 1,

        visibleSelectedTrack: true,
        selectedTrackID: -1,
        widthSelectedTrack: 4.0,
        opacitySelectedTrack: 1.0,
        selectedTrackColor: 0xffffff,
        selectedSubmissionTrackColor: 0xffa500,
        selectedTrackColorType: null,

        visibleSelectedHit: true,
        selectedHitID: -1,
        sizeSelectedHit: 16.0,
        opacitySelectedHit: 1.0,
        selectedHitColor: 0xffffff,
        selectedHitColorType: 1,

        searchEventID: "",
        searchHitID: "",
        searchTrackID: "",

        //compareSubmissionData: false,


        LStripBRenderOrder: 1,
        SStripBRenderOrder: 2,
        PSTBRenderOrder: 3,
        pixBRenderOrder: 4,
        beamPipeBRenderOrder: 5,

        beamPipeFRenderOrder: 6 +102,
        pixFRenderOrder: 7 +102,
        PSTFRenderOrder: 8 +102,
        SStripFRenderOrder: 9 +102,
        LStripFRenderOrder: 10 +102,

        particlesRenderOrder: 101,
        hitsRenderOrder: 100,
        tracksRenderOrder: 102,
        submittedTracksRenderOrder: 102,
        selectedTrackRenderOrder: 102,


        colorOK: "#125634",
        //colorErr: "#563412",
        colorErr: "#561212",
        colorWarn: "#535312",


        planeX: new RC.Plane(new RC.Vector3(1, 0, 0), 0),
        planeY: new RC.Plane(new RC.Vector3(0, -1, 0), 0),
        planeZ: new RC.Plane(new RC.Vector3(0, 0, -1), 0)
    }
};