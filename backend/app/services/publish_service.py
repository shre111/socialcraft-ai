"""
Phase 2: Social media publishing adapters.
Each platform class will be filled in once API credentials are configured.
"""
from __future__ import annotations
from abc import ABC, abstractmethod


class BasePlatformPublisher(ABC):
    @abstractmethod
    async def publish(self, text: str, hashtags: list[str]) -> str:
        """Returns the platform post ID."""
        ...


class InstagramPublisher(BasePlatformPublisher):
    async def publish(self, text: str, hashtags: list[str]) -> str:
        raise NotImplementedError("Instagram publishing — Phase 2")


class FacebookPublisher(BasePlatformPublisher):
    async def publish(self, text: str, hashtags: list[str]) -> str:
        raise NotImplementedError("Facebook publishing — Phase 2")


class LinkedInPublisher(BasePlatformPublisher):
    async def publish(self, text: str, hashtags: list[str]) -> str:
        raise NotImplementedError("LinkedIn publishing — Phase 2")


PUBLISHERS: dict[str, type[BasePlatformPublisher]] = {
    "instagram": InstagramPublisher,
    "facebook": FacebookPublisher,
    "linkedin": LinkedInPublisher,
}


def get_publisher(platform: str) -> BasePlatformPublisher:
    cls = PUBLISHERS.get(platform)
    if cls is None:
        raise ValueError(f"No publisher for platform: {platform}")
    return cls()
