"""Ensure proposed Blogger theme is semantically aligned with current identities."""
import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class BloggerSyncTests(unittest.TestCase):
 def test_proposed_theme(self):
  text=(R/'blogger/theme-aio-code-20261010.xml').read_text(encoding='utf-8')
  for required in ['Maria Alejandra Cuadros Lozada','Estratega digital','VOID MODE (VOID-001)','https://aio-code.vercel.app/entities/void-mode/','&quot;alternateName&quot;']:
   self.assertIn(required,text)
  self.assertNotIn('es su sistema creativo de identidad visual',text)
 def test_historical_theme_retained(self):
  self.assertTrue((R/'blogger/theme-aio-code-20260928.xml').is_file())
if __name__=='__main__':unittest.main()
