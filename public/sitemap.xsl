<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f6f6f6; }
          .small { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <p class="small">
          URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Hreflang</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <xsl:value-of select="sitemap:loc" />
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod" />
                </td>
                <td>
                  <xsl:for-each select="xhtml:link[@rel='alternate']">
                    <div class="small">
                      <xsl:value-of select="@hreflang" />:
                      <xsl:value-of select="@href" />
                    </div>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
