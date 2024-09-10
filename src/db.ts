import { AppSource } from "./config/ormconfig"


export const checkConnection = async()=>{
   try{
    await AppSource.initialize()
    console.log("DataSource Initialized")
   }
    catch(error){
        console.log("DataSource not Initialized")
    }
}