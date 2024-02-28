import { Primitive } from "./common.type"

export type PojoArray = Array<Pojo>
export type Pojo = Primitive | PojoArray | { [k: string]: Pojo }
