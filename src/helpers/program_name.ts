import chalk from "chalk";
import emoji from "node-emoji";

import { print_new_line } from "./new_line";

export const print_program_name = () => {
    print_new_line();
    console.log(`      ${chalk.bold("Price checker")}`);
    print_new_line();
};
