import nodemailer from "nodemailer";
import { PriceCheckerResult } from "./price-checker";
import { AvalilableStores } from "@data/db";

export const generateEmailHTML = (result: PriceCheckerResult, store: AvalilableStores) => {
    return `
        <h1>Store: ${store}</h1>
        <h2>Price Change</h2>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Old Price</th>
                    <th>New Price</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
                ${result
                    .map((product) => {
                        if ("priceChange" in product!) {
                            return `
                            <tr>
                                <td>${product.product?.name ?? ""}</td>
                                <td>${product.priceChange?.oldPrice ?? ""}</td>
                                <td>${product.priceChange?.newPrice ?? ""}</td>
                                <td><a href="${product.product?.url ?? ""}">${
                                product.product?.url ?? ""
                            }</a></td>
                            </tr>`;
                        }
                    })
                    .join("")}
            </tbody>
        </table>
        <h2>New Products</h2>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
                ${result
                    .map((product) => {
                        if ("newProduct" in product!) {
                            return `
                            <tr>
                                <td>${product.newProduct?.name ?? ""}</td>
                                <td>${product.newProduct?.price ?? ""}</td>
                                <td><a href="${product.newProduct?.url ?? ""}">${
                                product.newProduct?.url ?? ""
                            }</a></td>
                            </tr>`;
                        }
                    })
                    .join("")}
            </tbody>
        </table>
    `;
};

export const sendEmail = async (html: string, subject: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "mateus.rbossa@gmail.com",
        subject,
        html,
    });
};

export const makePriceChangeEmail = (result: PriceCheckerResult, store: AvalilableStores) => {
    const html = generateEmailHTML(result, store);
    const subject = `[ ${process.env.SERVER_NAME ?? "NONE"} ] Price Change bot`;

    return {
        html,
        subject,
    };
};
