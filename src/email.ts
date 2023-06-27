import nodemailer from "nodemailer";
import { HandleProductsResult } from "src";

export const generateEmailHTML = (result: HandleProductsResult) => {
    return `
        <h1>Price Change</h1>
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
                                <td><a href="${product.newProduct?.url ?? ""}">${
                                product.product?.url ?? ""
                            }</a></td>
                            </tr>`;
                        }
                    })
                    .join("")}
            </tbody>
        </table>
        <h1>New Products</h1>
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

export const sendEmail = async (result: HandleProductsResult) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const html = generateEmailHTML(result);

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "mateus.rbossa@gmail.com",
        subject: "Pichau Bot - Price Change",
        html: html,
    });
};