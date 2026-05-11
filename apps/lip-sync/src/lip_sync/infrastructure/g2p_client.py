import logging

from g2p_en import G2p

logger = logging.getLogger(__name__)


class G2PClient:
    def __init__(self):
        logger.info("Loading g2p-en model...")
        self.g2p = G2p()
        logger.info("g2p-en model loaded.")

    def word_to_phonemes(self, word: str) -> list[str]:
        """Convert a word to ARPAbet phonemes.

        Returns phonemes with stress markers (e.g. 'AH0', 'OW1').
        Filters out spaces and empty strings.
        """
        raw = self.g2p(word)
        return [p for p in raw if p.strip() and p != " "]
