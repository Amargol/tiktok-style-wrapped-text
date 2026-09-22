import { test, expect } from '@playwright/test';

const cases = [
  { name: 'literal newline', text: 'Take the\nscenic route.', lines: 2 },
  { name: 'HTML break', html: 'Take the<br>scenic route.', lines: 2 },
  { name: 'Windows newline', text: 'Take the\r\nscenic route.', lines: 2 },
  { name: 'blank line', text: 'Take the\n\nscenic route.', lines: 2 },
  { name: 'consecutive HTML breaks', html: 'Take the<br><br>scenic route.', lines: 2 },
  { name: 'zero vertical padding', text: 'Take the\nscenic route.', lines: 2, style: '--rt-py:0px' },
  { name: 'automatic wrapping', text: 'Take the scenic route and find something new.', minLines: 2, style: 'width:220px' },
];

for (const align of ['left', 'center', 'right']) {
  for (const fixture of cases) {
    test(`${fixture.name} stays connected (${align})`, async ({ page }) => {
      await page.goto('/examples/line-breaks.html');
      const result = await page.evaluate(async ({ fixture, align }) => {
        const { ready } = await import('/lib/roundtext.js');
        await ready();
        const el = document.createElement('tiktok-text');
        el.setAttribute('size', '40');
        el.setAttribute('align', align);
        el.style.cssText = `width:500px;${fixture.style || ''}`;
        if (fixture.html) el.innerHTML = fixture.html;
        else el.textContent = fixture.text;
        document.body.append(el);
        let detail;
        el.addEventListener('roundtext:render', event => { detail = event.detail; });
        el.refresh();
        return detail;
      }, { fixture, align });
      if (fixture.lines) expect(result.lines).toBe(fixture.lines);
      else expect(result.lines).toBeGreaterThanOrEqual(fixture.minLines);
      expect(result.path.match(/M /g)).toHaveLength(1);
      expect(result.path).not.toMatch(/NaN|Infinity/);
      for (let i = 1; i < result.rectangles.length; i++) {
        expect(result.rectangles[i].top).toBeLessThanOrEqual(result.rectangles[i - 1].bottom);
      }
    });
  }
}
