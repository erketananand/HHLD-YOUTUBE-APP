import { RESOLUTIONS } from "../types/constant";
import AWS from 'aws-sdk';
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
ffmpeg.setFfmpegPath(ffmpegStatic as string);

const s3 = new AWS.S3({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export class HlsConverterController {
    public static async convertToHLS(fileName = 'my-idol-sachin-tendulkar.mp4') {
        const variantPlaylists = [];
        for (const { resolution, videoBitrate, audioBitrate } of RESOLUTIONS) {
            console.log(`HLS conversion starting for ${resolution}`);
            const outputFileName = `${fileName.replace(
                '.',
                '_'
            )}_${resolution}.m3u8`;
            const segmentFileName = `${fileName.replace(
                '.',
                '_'
            )}_${resolution}_%03d.ts`;
            await new Promise((resolve, reject) => {
                ffmpeg('/Users/air/Documents/HHLD/hhld-youtube-app/backend/assets/my-idol-sachin-tendulkar.mp4')
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
                const bandwidth =
                    resolution === '320x180'
                        ? 676800
                        : resolution === '854x480'
                            ? 1353600
                            : 3230400;
                return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
            })
            .join('\n');
        masterPlaylist = `#EXTM3U\n` + masterPlaylist;

        const masterPlaylistFileName = `${fileName.replace(
            '.',
            '_'
        )}_master.m3u8`;
        const masterPlaylistPath = `output/${masterPlaylistFileName}`;
        await fs.writeFileSync(masterPlaylistPath, masterPlaylist);
        console.log(`HLS master m3u8 playlist generated`);
    }

    public static async s3ToS3 (fileName: string){
        console.log('Starting script');
        console.time('req_time');
        const bucketName = process.env.AWS_BUCKET_NAME as string,
            hlsFolder = 'hls';
        try {
            console.log('Downloading s3 mp4 file locally');
            const mp4FilePath = `${fileName}`;
            const writeStream = fs.createWriteStream('local.mp4');
            const readStream = s3
                .getObject({ Bucket: bucketName, Key: mp4FilePath })
                .createReadStream();
            readStream.pipe(writeStream);
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            console.log('Downloaded s3 mp4 file locally');
     
            const variantPlaylists = [];
            for (const { resolution, videoBitrate, audioBitrate } of RESOLUTIONS) {
                console.log(`HLS conversion starting for ${resolution}`);
                const outputFileName = `${fileName.replace(
                    '.',
                    '_'
                )}_${resolution}.m3u8`;
                const segmentFileName = `${fileName.replace(
                    '.',
                    '_'
                )}_${resolution}_%03d.ts`;
                await new Promise((resolve, reject) => {
                    ffmpeg('./local.mp4')
                        .outputOptions([
                            `-c:v h264`,
                            `-b:v ${videoBitrate}`,
                            `-c:a aac`,
                            `-b:a ${audioBitrate}`,
                            `-vf scale=${resolution}`,
                            `-f hls`,
                            `-hls_time 10`,
                            `-hls_list_size 0`,
                            `-hls_segment_filename hls/${segmentFileName}`
                        ])
                        .output(`hls/${outputFileName}`)
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
                    const bandwidth =
                        resolution === '320x180'
                            ? 676800
                            : resolution === '854x480'
                            ? 1353600
                            : 3230400;
                    return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
                })
                .join('\n');
            masterPlaylist = `#EXTM3U\n` + masterPlaylist;
     
     
            const masterPlaylistFileName = `${fileName.replace(
                '.',
                '_'
            )}_master.m3u8`;
            const masterPlaylistPath = `hls/${masterPlaylistFileName}`;
            fs.writeFileSync(masterPlaylistPath, masterPlaylist);
            console.log(`HLS master m3u8 playlist generated`);
     
     
            console.log(`Deleting locally downloaded s3 mp4 file`);
     
     
            fs.unlinkSync('local.mp4');
            console.log(`Deleted locally downloaded s3 mp4 file`);
     
     
            console.log(`Uploading media m3u8 playlists and ts segments to s3`);
     
     
            const files = fs.readdirSync(hlsFolder);
            for (const file of files) {
                if (!file.startsWith(fileName.replace('.', '_'))) {
                    continue;
                }
                const filePath = path.join(hlsFolder, file);
                const fileStream = fs.createReadStream(filePath);
                const uploadParams: any = {
                    Bucket: bucketName,
                    Key: `${hlsFolder}/${file}`,
                    Body: fileStream,
                    ContentType: file.endsWith('.ts')
                        ? 'video/mp2t'
                        : file.endsWith('.m3u8')
                        ? 'application/x-mpegURL'
                        : null
                };
                await s3.upload(uploadParams).promise();
                fs.unlinkSync(filePath);
            }
            console.log(
                `Uploaded media m3u8 playlists and ts segments to s3. Also deleted locally`
            );
     
     
            console.log('Success. Time taken: ');
            console.timeEnd('req_time');
        } catch (error) {
            console.error('Error:', error);
        }
     }     
}