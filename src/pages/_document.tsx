// src/pages/_document.tsx
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    // 環境変数で設定された basePath を反映
    const baseHref = process.env.NEXT_PUBLIC_BASE_PATH || "./";
    console.log("🛠 _document.tsx → baseHref=", baseHref);

    return (
      <Html lang="ja">
        <Head>
          {/* 開発時は "/"、本番 GH Pages では "/hitblow-next/" */}
          <base href={baseHref} />
          {/* localStorage からテーマ属性をセット */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => {
                try {
                  const t = localStorage.getItem('theme');
                  if (t) document.documentElement.setAttribute('data-theme', t);
                } catch {}
              })();`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
