import emoji from "node-emoji";

import { print_new_line } from "./new_line";

export const exit = () => {
    print_new_line();
    console.log(`Até mais... ${emoji.get("wave")}`);
    print_new_line();

    process.exit(0);
};
