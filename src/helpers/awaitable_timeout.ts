export const awaitableTimeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
