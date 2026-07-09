import cf from "cloudfront";

const kvsHandle = cf.kvs();

function generateContent(options, redirectBaseUrl, supportUrl, version) {
  return (
    `<!DOCTYPE html>
<html lang="${options.languageCode}" class="govuk-template govuk-template--rebranded">
<head>
    <meta charset="utf-8">
    <title>${options.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b0c0c">

    <link rel="icon" sizes="48x48" href="/govuk-frontend/${version}/assets/rebrand/images/favicon.ico">
    <link rel="icon" sizes="any" href="/govuk-frontend/${version}/assets/rebrand/images/favicon.svg" type="image/svg+xml">
    <link rel="mask-icon" href="/govuk-frontend/${version}/assets/rebrand/images/govuk-icon-mask.svg" color="#0b0c0c">
    <link rel="apple-touch-icon" href="/govuk-frontend/${version}/assets/rebrand/images/govuk-icon-180.png">
    <link rel="manifest" href="/govuk-frontend/${version}/assets/rebrand/manifest.json">

    <link href="/govuk-frontend/${version}/govuk-frontend-5.11.0.min.css" rel="stylesheet">
</head>

<body class="govuk-template__body ">
    <a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>

    <header class="govuk-header" data-module="govuk-header">
      <div class="govuk-header__container govuk-width-container">
        <div class="govuk-header__logo">
          <a href="https://www.gov.uk/" class="govuk-header__link govuk-header__link--homepage">
            <img src="/govuk-frontend/${version}/assets/custom/govuk-logo.svg" alt="GOV.UK" class="govuk-header__logotype">
          </a>
        </div>
      </div>
    </header>

    <div class="govuk-width-container ">
        <div class="govuk-phase-banner">
            <p class="govuk-phase-banner__content">
                <strong class="govuk-tag govuk-phase-banner__content__tag">beta</strong>
                <span class="govuk-phase-banner__text">${options.banner.start}
                    <a href="` +
    supportUrl +
    `" class="govuk-link" rel="noopener" target="_blank">${options.banner.linkText}</a>${options.banner.end}
                </span>
            </p>
        </div>
        <main class="govuk-main-wrapper " id="main-content" role="main">
            <h1 class="govuk-heading-l">${options.heading}</h1>
            <p class="govuk-body">${options.signIn.start} <a href="` +
    redirectBaseUrl +
    `" class="govuk-link" rel="noreferrer noopener">${options.signIn.linkText}</a></p>
            <p class="govuk-body">${options.homePage.start} <a href="https://gov.uk" class="govuk-link" rel="noreferrer noopener">${options.homePage.linkText}</a>.</p>
            <div class="govuk-inset-text">
                ${options.changeLanguage.start}<a href="?lng=${options.changeLanguage.languageCode}" class="govuk-link" rel="noreferrer">${options.changeLanguage.linkText}<span lang="${options.changeLanguage.languageCode}">${options.changeLanguage.language}</span></a>.
            </div>
        </main>
    </div>

    <footer class="govuk-footer">
      <div class="govuk-width-container">
        <img src="/govuk-frontend/${version}/assets/custom/govuk-crown.svg" alt="Crown" class="govuk-footer__crown" role="presentation">

        <div class="govuk-footer__meta">
          <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <img src="/govuk-frontend/${version}/assets/custom/ogl-logo.svg" alt="OGL" aria-hidden="true" class="govuk-footer__licence-logo">
            <span class="govuk-footer__licence-description">
              ${options.ogl.start}
              <a
                class="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license">${options.ogl.linkText}</a>, ${options.ogl.end}
            </span>
          </div>
          <div class="govuk-footer__meta-item">
            <a
              class="govuk-footer__link govuk-footer__copyright-logo"
              href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
              ${options.crownCopyright}
            </a>
          </div>
        </div>
      </div>
    </footer>
</body>
</html>`
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(event) {
  let redirectBaseUrl = "";
  let supportUrl = "";
  let version = "";
  try {
    redirectBaseUrl = await kvsHandle.get("redirectBaseUrl");
    supportUrl = await kvsHandle.get("supportUrl");
    version = await kvsHandle.get("version");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`KVS lookup failed: ${err}`);
  }
  if (
    event.request.uri == "/security.txt" ||
    event.request.uri == "/.well-known/security.txt"
  )
    return {
      statusCode: 302,
      headers: {
        location: {
          value: "https://vdp.cabinetoffice.gov.uk/.well-known/security.txt",
        },
      },
      body: "Found. Redirecting to https://vdp.cabinetoffice.gov.uk/.well-known/security.txt",
    };

  return {
    statusCode: 200,
    headers: {
      "content-type": { value: "text/html; charset=utf-8" },
      "cloudfront-functions": { value: "generated-by-CloudFront-Functions" },
    },
    body: {
      encoding: "text",
      data: (function () {
        var cookies_as_string = JSON.stringify(event.request.cookies),
          lang_from_query_string = event.request.querystring.lng
            ? event.request.querystring.lng.value
            : false,
          welshOptions = {
            languageCode: "cy",
            title:
              "Mae’r dudalen rydych yn chwilio amdani wedi’i dileu - GOV.UK One Login",
            heading: "Mae’r dudalen rydych yn chwilio amdani wedi’i dileu",
            banner: {
              start: "Mae hwn yn wasanaeth newydd – bydd eich ",
              linkText: "adborth (agor mewn tab newydd)",
              end: " yn ein helpu i’w wella.",
            },
            signIn: {
              start: "I fewngofnodi i GOV.UK One Login, ewch i:",
              linkText: "gov.uk/account",
            },
            homePage: {
              start: "Neu ewch i dudalen ",
              linkText: "hafan GOV.UK",
            },
            changeLanguage: {
              start: "Gallwch hefyd ",
              linkText: "weld y dudalen hon yn Saesneg ",
              language: "(English)",
              languageCode: "en",
            },
            ogl: {
              start: "Mae’r holl gynnwys ar gael o dan ",
              linkText: "Trwydded Llywodraeth Agored v3.0",
              end: "oni nodir yn wahanol",
            },
            crownCopyright: "© Hawlfraint y goron",
          },
          englishOptions = {
            languageCode: "en",
            title:
              "The page you’re looking for has been removed - GOV.UK One Login",
            heading: "The page you're looking for has been removed",
            banner: {
              start: "This is a new service – your ",
              linkText: "feedback (opens in new tab)",
              end: " will help us to improve it.",
            },
            signIn: {
              start: "To sign in to GOV.UK One Login, go to:",
              linkText: "gov.uk/account",
            },
            homePage: {
              start: "Or go to the ",
              linkText: "GOV.UK homepage",
            },
            changeLanguage: {
              start: "You can also ",
              linkText: "see this page in Welsh ",
              language: "(Cymraeg)",
              languageCode: "cy",
            },
            ogl: {
              start: "All content is available under the ",
              linkText: "Open Government Licence v3.0",
              end: "except where otherwise stated",
            },
            crownCopyright: "© Crown copyright",
          };

        if (lang_from_query_string === "cy") {
          return generateContent(
            welshOptions,
            redirectBaseUrl,
            supportUrl,
            version
          );
        }

        if (cookies_as_string.indexOf("lng") !== -1) {
          if (event.request.cookies.lng.value === "cy") {
            return generateContent(
              welshOptions,
              redirectBaseUrl,
              supportUrl,
              version
            );
          } else {
            return generateContent(
              englishOptions,
              redirectBaseUrl,
              supportUrl,
              version
            );
          }
        } else {
          return generateContent(
            englishOptions,
            redirectBaseUrl,
            supportUrl,
            version
          );
        }
      })(),
    },
  };
}
