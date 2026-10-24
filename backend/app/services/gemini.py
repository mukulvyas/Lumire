import json
import logging
from typing import Type, TypeVar, Optional, Any, Dict
import httpx
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.LLM_MODEL or "gemini-1.5-flash"
        self.provider = settings.LLM_PROVIDER

    async def generate_structured(
        self,
        schema_cls: Type[T],
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        fallback_data: Optional[Dict[str, Any]] = None,
    ) -> T:
        """
        Calls Gemini API with structured JSON output, or falls back to mock data if key is missing/offline.
        """
        if self.provider == "mock" or not self.api_key:
            logger.info("Using mock/offline LLM response for %s", schema_cls.__name__)
            if fallback_data is not None:
                return schema_cls.model_validate(fallback_data)
            return self._generate_default_mock(schema_cls)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": user_prompt}]}
            ],
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": temperature
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                
                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidates returned from Gemini API")
                
                text_content = candidates[0]["content"]["parts"][0]["text"]
                clean_json = text_content.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                
                parsed = json.loads(clean_json.strip())
                return schema_cls.model_validate(parsed)
        except Exception as e:
            logger.warning("Gemini API call failed (%s); using fallback.", str(e))
            if fallback_data is not None:
                return schema_cls.model_validate(fallback_data)
            return self._generate_default_mock(schema_cls)

    def _generate_default_mock(self, schema_cls: Type[T]) -> T:
        name = schema_cls.__name__
        if name == "EventBrief":
            return schema_cls.model_validate({
                "title": "Royal Palace Heritage Wedding",
                "type": "wedding",
                "event_date": "2027-02-14",
                "city": "Jaipur",
                "region_code": "IN-RJ",
                "guest_target": 150,
                "total_budget": 1500000.0,
                "currency": "INR",
                "locale": "en-IN",
                "preferences": {
                    "style": "Regal Heritage & Intimate Luxury",
                    "culture": "Rajasthani Royal Elegance",
                    "theme": "Luminous Celebration Atelier"
                },
                "missing_fields": [],
                "clarifying_questions": []
            })
        elif name == "BudgetPlan":
            return schema_cls.model_validate({
                "categories": [
                    {"name": "Venue & Stay", "planned": 675000.0, "sort_order": 1},
                    {"name": "Catering & Bar", "planned": 375000.0, "sort_order": 2},
                    {"name": "Décor & Florals", "planned": 225000.0, "sort_order": 3},
                    {"name": "Photography & Film", "planned": 120000.0, "sort_order": 4},
                    {"name": "Music & Experience", "planned": 45000.0, "sort_order": 5},
                    {"name": "Buffer / Contingency", "planned": 60000.0, "sort_order": 6},
                ]
            })
        elif name == "Timeline":
            return schema_cls.model_validate({
                "tasks": [
                    {"title": "Sign Venue Contract & Deposit", "phase": "Phase 1: Foundation", "due_date": "2026-11-15", "ai_tip": "Lock in winter dates early.", "sort_order": 1},
                    {"title": "Finalize Musical Ensemble", "phase": "Phase 2: Experience", "due_date": "2026-12-05", "ai_tip": "Peak artists book 6 months out.", "sort_order": 2},
                    {"title": "Confirm Tasting Menu", "phase": "Phase 2: Experience", "due_date": "2026-12-20", "ai_tip": "Note dietary requirements.", "sort_order": 3},
                    {"title": "Send Digital Invitations", "phase": "Phase 3: Logistics", "due_date": "2027-01-10", "ai_tip": "Allows prompt travel bookings.", "sort_order": 4},
                    {"title": "Approve Floral Installations", "phase": "Phase 3: Logistics", "due_date": "2027-01-25", "ai_tip": "Local marigolds and jasmine reduce cost.", "sort_order": 5},
                ],
                "run_sheet": [
                    {"start_time": "15:00", "end_time": "16:30", "title": "Baraat & Grand Welcome", "details": "Traditional dhol procession and rosewater greeting."},
                    {"start_time": "16:30", "end_time": "18:00", "title": "Varmala & Sunset Pheras", "details": "Courtyard mandap ceremony at dusk."},
                    {"start_time": "19:00", "end_time": "23:00", "title": "Royal Banquet & Sangeet", "details": "Under candlelight arches with live fusion sitar."},
                ]
            })
        elif name == "VendorChecklist":
            return schema_cls.model_validate({
                "vendors": [
                    {"name": "Taj Jai Mahal Palace Grounds", "category": "Venue & Stay", "quote_amount": 650000.0, "status": "confirmed", "note": "Heritage lawn & courtyard included."},
                    {"name": "Royal Feast Caterers", "category": "Catering & Bar", "quote_amount": 360000.0, "status": "quoted", "note": "3 live counters + Rajasthani delicacies."},
                    {"name": "Gulabi Marigold Studios", "category": "Décor & Florals", "quote_amount": 210000.0, "status": "contacted", "note": "Sustainable floral structures."},
                    {"name": "Lumière Heritage Wedding Films", "category": "Photography & Film", "quote_amount": 100000.0, "status": "contacted", "note": "Drone coverage & 3 cinematographers."},
                    {"name": "Jaipur Folk Ensemble & DJ", "category": "Music & Experience", "quote_amount": 40000.0, "status": "contacted", "note": "Sunset shehnai + evening celebration."},
                ]
            })
        elif name == "IdeaSet":
            return schema_cls.model_validate({
                "ideas": [
                    {"kind": "decor", "title": "Sunset Diya Canopy", "reason": "Handcrafted earthen oil lamps create celestial ambiance without heavy plastic fabrication.", "est_cost": 25000.0, "saved": False},
                    {"kind": "gifts", "title": "Block-Printed Shawls for Guests", "reason": "Sourced directly from local Sanganer artisans; doubles as a keepsake.", "est_cost": 35000.0, "saved": False},
                    {"kind": "menu", "title": "Artisanal Chai & Kachori Bar", "reason": "High-engagement arrival counter showcasing regional spices.", "est_cost": 15000.0, "saved": True},
                ]
            })
        elif name == "VendorQuestionsResponse":
            return schema_cls.model_validate({
                "questions": [
                    {"question": "Does the quote include GST and emergency power generator backup?", "priority": "critical"},
                    {"question": "What is the overtime rate per hour if the evening extends past midnight?", "priority": "high"},
                    {"question": "What is the advance payment breakdown and cancellation refund policy?", "priority": "critical"},
                    {"question": "Do you bring your own setup crew and cleanup team or is that billed separately?", "priority": "standard"}
                ]
            })
        elif name == "PlanPatch":
            return schema_cls.model_validate({
                "reasoning": "Rebalancing budget categories to accommodate priority requests.",
                "operations": [
                    {"type": "rebalanceCategory", "category_name": "Venue & Stay", "amount": 620000.0},
                    {"type": "rebalanceCategory", "category_name": "Décor & Florals", "amount": 250000.0}
                ]
            })
        raise ValueError(f"No mock generator defined for {name}")

gemini_service = GeminiService()
