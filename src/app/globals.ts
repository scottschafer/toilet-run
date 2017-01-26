export class Globals {
    private static _instance:Globals;

    static instance():Globals {
        if (!Globals._instance)
        return Globals._instance;
    }
}