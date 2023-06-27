type StockParams = {
    readonly ticker: string;
    readonly currentPrice: string;
    readonly ev_Ebit: number;
    readonly roic: number;
    readonly p_L?: number;
    readonly p_VP?: number;
    readonly p_Ebit?: number;
    readonly p_Ativo?: number;
    readonly companyName?: string;
    readonly volume2Months?: string;
    readonly liquidezCorrente?: number;
    readonly liquidezMediaDiaria?: number;
    readonly setor?: string;
    readonly subsetor?: string;
    readonly segmento?: string;
};

export class Stock {
    public readonly ticker: string;
    public readonly currentPrice: string;
    public readonly ev_Ebit: number;
    public readonly roic: number;
    public readonly p_L: number;
    public readonly p_VP: number;
    public readonly p_Ebit: number;
    public readonly p_Ativo: number;
    public readonly companyName: string;
    public readonly volume2Months: string;
    public readonly liquidezCorrente: number;
    public readonly liquidezMediaDiaria: number;
    public readonly setor: string;
    public readonly subsetor: string;
    public readonly segmento: string;

    constructor(properties: StockParams) {
        this.ticker = properties.ticker;
        this.currentPrice = properties.currentPrice;
        this.p_L = properties.p_L || 0;
        this.p_VP = properties.p_VP || 0;
        this.p_Ebit = properties.p_Ebit || 0;
        this.p_Ativo = properties.p_Ativo || 0;
        this.ev_Ebit = properties.ev_Ebit || 0;
        this.roic = properties.roic || 0;
        this.companyName = properties.companyName || "";
        this.volume2Months = properties.volume2Months || "";
        this.liquidezCorrente = properties.liquidezCorrente || 0;
        this.liquidezMediaDiaria = properties.liquidezMediaDiaria || 0;
        this.setor = properties.setor || "";
        this.subsetor = properties.subsetor || "";
        this.segmento = properties.segmento || "";
    }
}
