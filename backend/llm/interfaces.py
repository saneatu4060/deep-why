from abc import ABC, abstractmethod


class LLMInterface(ABC):
    """LLM呼び出しのインターフェース（テスト時はFakeLLMに差し替える）"""

    @abstractmethod
    def score(self, user_input: str, category: str, turn_number: int) -> dict:
        """採点を実行してスコアJSONを返す"""
        pass

    @abstractmethod
    def generate_question(self, question_type: str, context: dict) -> str:
        """問い文を生成して返す"""
        pass

    @abstractmethod
    def generate_logic_map(self, turns: list[dict]) -> str:
        """全ターンの発言からMermaidグラフを生成して返す"""
        pass


class FakeLLM(LLMInterface):
    """テスト用のFake実装。Ollamaを使わずに固定値を返す"""

    def score(self, user_input: str, category: str, turn_number: int) -> dict:
        result = {
            "concreteness": 0.50,
            "causality": 0.50,
            "definitiveness": 0.50,
            "reason": "テスト用の固定スコアです",
        }
        if turn_number == 1:
            result["topic_summary"] = "テストテーマ"
        return result

    def generate_question(self, question_type: str, context: dict) -> str:
        return "これはテスト用の固定の問いです。"

    def generate_logic_map(self, turns: list[dict]) -> str:
        return "graph TD\n  A[開始] --> B[結論]"
