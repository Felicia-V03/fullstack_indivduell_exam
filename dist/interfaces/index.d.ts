export interface BookBasic {
    title: string;
}
export interface BookOpen extends BookBasic {
    imageId?: number;
    author: string;
    publishYear: number;
}
export interface BookWithData extends BookOpen {
    imageUrl?: string;
}
//# sourceMappingURL=index.d.ts.map