export interface BookBasic {
    title: string;
}
export interface BookOpen extends BookBasic {
    imageId?: number | null;
    author: string;
    publishYear: number | null;
}
export interface BookWithData extends BookOpen {
    imageUrl: string;
}
//# sourceMappingURL=index.d.ts.map