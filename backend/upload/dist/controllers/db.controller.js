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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbController = void 0;
const db_1 = require("../db/db");
class DbController {
    static uploadToDb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Adding details to DB");
            try {
                const videoDetails = req.body;
                const response = yield db_1.Db.addVideoDetailsToDB(videoDetails.title, videoDetails.description, videoDetails.author, videoDetails.url);
                return res.status(200).send(response);
            }
            catch (error) {
                console.log("Error in adding to DB ", error);
                return res.status(400).send(error);
            }
        });
    }
}
exports.DbController = DbController;
//# sourceMappingURL=db.controller.js.map