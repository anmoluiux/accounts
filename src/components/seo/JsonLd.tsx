type Schema = Record<string, unknown>;

/**
 * Emits JSON-LD into the document.
 *
 * A server component with no interactivity, so the markup lands in the
 * prerendered HTML of the static export. That matters: most link-preview bots
 * and several crawlers never execute JavaScript, and structured data injected
 * after hydration is invisible to them.
 *
 * `<` is escaped to `<` because the payload is written with
 * `dangerouslySetInnerHTML`. Without it, any user- or CMS-supplied string
 * containing `</script>` would close the tag early and inject markup. Nothing
 * here is user-supplied today; the escape is what keeps that true if it ever
 * becomes so.
 */
export function JsonLd({ data, id }: { data: Schema | Schema[]; id?: string }) {
  const payload = Array.isArray(data) ? data : [data];
  const json = JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(/</g, "\\u003c");

  return <script type="application/ld+json" id={id} dangerouslySetInnerHTML={{ __html: json }} />;
}
