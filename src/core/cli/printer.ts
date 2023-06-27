import { print_new_line } from "@helpers/new_line";
import prompts from "prompts";
import * as Table from "table";
import { PromptName, pageMovePrompt } from "./prompts/page-move";
import { PageMoveResult, pageMoveHandler } from "./handlers/page-move-handler";
import { Choices } from "./prompts/page-move/choices";
import { log } from "console";

class Printer {
    private currentPage = 1;
    private amountPerPage = 10;
    private headers: string[] = [];
    private rows: string[][] = [];
    private table_config?: Table.StreamUserConfig;
    private lastSelectedChoice?: Choices;

    public setHeaders(headers: string[]) {
        this.headers = headers;
        return this;
    }

    public setRows(rows: string[][]) {
        this.rows = rows;
        return this;
    }

    public setTableConfig(table_config: Table.StreamUserConfig) {
        this.table_config = table_config;
        return this;
    }

    public resetLastSelectedChoice() {
        this.lastSelectedChoice = undefined;
        return this;
    }

    public async printTable() {
        if (this.table_config === undefined) {
            throw new Error("You must set a table config");
        }

        const stream = Table.createStream(this.table_config);
        stream.write(this.headers);

        const rowsPerPage = this.rows.slice(
            (this.currentPage - 1) * this.amountPerPage,
            this.amountPerPage * this.currentPage
        );

        for (const row of rowsPerPage) {
            stream.write(row);
        }

        print_new_line();

        await this.askNextPage();
    }

    private async askNextPage() {
        const response = await prompts(
            pageMovePrompt(this.currentPage, this.getTotalNumberOfPages(), this.lastSelectedChoice)
        );
        this.lastSelectedChoice = response[PromptName.Name];

        const result = await pageMoveHandler(response);

        if (!result) {
            return;
        }

        switch (result) {
            case PageMoveResult.NextPage:
                this.currentPage++;
                break;
            case PageMoveResult.PreviousPage:
                this.currentPage--;
                break;
            case PageMoveResult.FirstPage:
                this.currentPage = 1;
                break;
            case PageMoveResult.LastPage:
                this.currentPage = this.getTotalNumberOfPages();
                break;
        }

        console.clear();

        await this.printTable();
    }

    private getTotalNumberOfPages() {
        return Math.ceil(this.rows.length / this.amountPerPage);
    }
}

export const printer = new Printer();
