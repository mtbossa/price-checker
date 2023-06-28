import * as path from "path";
import moduleAlias from "module-alias";

const files = path.resolve(__dirname, "../..");

moduleAlias.addAliases({
    "@root": path.join(files, "src"),
    "@core": path.join(files, "src/core"),
    "@data": path.join(files, "src/data"),
    "@models": path.join(files, "src/models"),
    "@helpers": path.join(files, "src/helpers"),
    "@config": path.join(files, "src/config"),
});
