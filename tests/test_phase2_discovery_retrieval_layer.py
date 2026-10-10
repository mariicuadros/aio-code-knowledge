import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Phase2DiscoveryRetrievalLayerTests(unittest.TestCase):
    def test_crawler_policy_never_promotes_unverified_meta_claims(self):
        policy = json.loads((ROOT / "phase-2/crawler-policy-v1.json").read_text(encoding="utf-8"))
        meta = [x for x in policy["agents"] if x["provider"] == "Meta"]
        self.assertTrue(meta)
        self.assertTrue(all(x["evidence_state"] == "ai_reported_unverified" for x in meta))
        self.assertTrue(all(x["desired_policy"] == "do_not_encode_until_verified" for x in meta))

    def test_search_and_training_are_separate_for_openai(self):
        policy = json.loads((ROOT / "phase-2/crawler-policy-v1.json").read_text(encoding="utf-8"))
        agents = {x["agent"]: x for x in policy["agents"]}
        self.assertEqual(agents["OAI-SearchBot"]["function"], "search_discovery")
        self.assertEqual(agents["OAI-SearchBot"]["desired_policy"], "allow")
        self.assertEqual(agents["GPTBot"]["function"], "foundation_model_training_crawl")
        self.assertEqual(agents["GPTBot"]["desired_policy"], "policy_decision_pending")

    def test_observation_schema_keeps_pipeline_states_separate(self):
        schema = json.loads((ROOT / "schemas/ai-observation-record.schema.json").read_text(encoding="utf-8"))
        props = schema["properties"]["result_state"]["properties"]
        expected = {"published","crawlable","crawl_observed","indexation_observed","retrieved","entity_resolved","attributed","cited","answered"}
        self.assertEqual(set(props), expected)

if __name__ == "__main__":
    unittest.main()
