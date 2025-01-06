import random
import time
from datetime import datetime

class GameLogic:
    def __init__(self):
        self.images = []
        self.matched_cards = []
        self.selected_cards = []
        self.time_limit = 50
        self.remaining_time = self.time_limit
        self.player_name = None
        self.start_time = None
        self.mode = "normal"

    def start(self, player_name, difficulty):
        self.player_name = player_name
        self.mode = difficulty
        self.setup_game_board()

    def setup_game_board(self):
        num_pairs = 6 if self.mode == "easy" else 10
        self.images = [f"{i}.jpg" for i in range(1, num_pairs + 1)] * 2
        random.shuffle(self.images)

    def flip_card(self, index):
        if index in self.selected_cards:
            return {"status": "Already flipped"}

        self.selected_cards.append(index)
        if len(self.selected_cards) == 2:
            return self.check_match()
        return {"status": "Card flipped"}

    def check_match(self):
        idx1, idx2 = self.selected_cards
        if self.images[idx1] == self.images[idx2]:
            self.matched_cards.append(self.images[idx1])
            self.selected_cards = []
            if len(self.matched_cards) == len(self.images) // 2:
                return {"status": "Game completed"}
        else:
            self.selected_cards = []
        return {"status": "Continue"}

    def end_game(self, success):
        score = self.calculate_score(success)
        self.save_score(score)
        return score

    def calculate_score(self, success):
        if not success:
            return 0
        return 1000 - (int(time.time() - self.start_time) * 2)

    def save_score(self, score):
        # Supabase 점수 저장
        pass
