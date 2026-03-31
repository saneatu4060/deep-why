/**
 * テーマカテゴリとプレースホルダーの型定義
 */
export interface ThemeCategory {
    label: string;
    placeholder: string;
}

/**
 * S01 ホーム画面：テーマカテゴリ一覧と対応するプレースホルダー
 */
export const THEME_CATEGORIES: ThemeCategory[] = [
    {
        label: "技術・スキル",
        placeholder: "例：自分が得意な技術領域はどこか",
    },
    {
        label: "タスク・業務",
        placeholder: "例：このタスクをどう分解するか",
    },
    {
        label: "コミュニケーション",
        placeholder: "例：あの報連相はなぜうまくいかなかったか",
    },
    {
        label: "キャリア・強み",
        placeholder: "例：自分はどんなエンジニアになりたいか",
    },
    {
        label: "価値観",
        placeholder: "例：どんな仕事にやりがいを感じるか",
    },
    {
        label: "自由入力",
        placeholder: "例：今日深めたいことを入力してください",
    },
];