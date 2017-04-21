import { injectable, inject } from "inversify";
import "reflect-metadata";

import {IBootService, types} from "../contract/IBootService";

@injectable()
class bootService implements IBootService {
    booted(process: any) {
        
    }
}