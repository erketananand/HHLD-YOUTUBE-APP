"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HlsConverterController = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fs_1 = __importDefault(require("fs"));
const constant_1 = require("../types/constant");
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
class HlsConverterController {
    static convertToHLS() {
        return __awaiter(this, arguments, void 0, function* (fileName = 'my-idol-sachin-tendulkar.mp4') {
            const variantPlaylists = [];
            for (const { resolution, videoBitrate, audioBitrate } of constant_1.RESOLUTIONS) {
                console.log(`HLS conversion starting for ${resolution}`);
                const outputFileName = `${fileName.replace('.', '_')}_${resolution}.m3u8`;
                const segmentFileName = `${fileName.replace('.', '_')}_${resolution}_%03d.ts`;
                yield new Promise((resolve, reject) => {
                    (0, fluent_ffmpeg_1.default)('/Users/air/Documents/HHLD/hhld-youtube-app/backend/assets/my-idol-sachin-tendulkar.mp4')
                        .outputOptions([
                        `-c:v h264`,
                        `-b:v ${videoBitrate}`,
                        `-c:a aac`,
                        `-b:a ${audioBitrate}`,
                        `-vf scale=${resolution}`,
                        `-f hls`,
                        `-hls_time 10`,
                        `-hls_list_size 0`,
                        `-hls_segment_filename output/${segmentFileName}`
                    ])
                        .output(`output/${outputFileName}`)
                        .on('end', () => resolve('done'))
                        .on('error', (err) => reject(err))
                        .run();
                });
                const variantPlaylist = {
                    resolution,
                    outputFileName
                };
                variantPlaylists.push(variantPlaylist);
                console.log(`HLS conversion done for ${resolution}`);
            }
            console.log(`HLS master m3u8 playlist generating`);
            let masterPlaylist = variantPlaylists
                .map((variantPlaylist) => {
                const { resolution, outputFileName } = variantPlaylist;
                const bandwidth = resolution === '320x180'
                    ? 676800
                    : resolution === '854x480'
                        ? 1353600
                        : 3230400;
                return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
            })
                .join('\n');
            masterPlaylist = `#EXTM3U\n` + masterPlaylist;
            const masterPlaylistFileName = `${fileName.replace('.', '_')}_master.m3u8`;
            const masterPlaylistPath = `output/${masterPlaylistFileName}`;
            yield fs_1.default.writeFileSync(masterPlaylistPath, masterPlaylist);
            console.log(`HLS master m3u8 playlist generated`);
        });
    }
}
exports.HlsConverterController = HlsConverterController;
//# sourceMappingURL=hls-converter.controller.js.map