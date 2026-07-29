from ai_service.signals.detectors import (
    detect_all_signals,
    detect_missing_company_profile,
    detect_missing_company_website,
    detect_missing_location,
    detect_personal_email_domain,
    detect_poor_grammar_or_spam_wording,
    detect_registration_fee_requested,
    detect_unrealistic_salary,
    detect_unverified_website_or_email,
    detect_urgent_or_spam_wording,
    detect_whatsapp_only_contact,
    extract_email_domain,
)

LEGIT_FIELDS = {
    "title": "Assistant Professor",
    "company_profile": "Keshav Memorial Institute of Technology is an established engineering "
                        "college in Hyderabad affiliated to Osmania University, offering "
                        "undergraduate and postgraduate programs since 2007.",
    "description": "We are looking for an experienced Assistant Professor to join our "
                    "Computer Science department. Visit https://kmit.in for details.",
    "requirements": "M.Tech or Ph.D in relevant discipline.",
    "benefits": "Health insurance and provident fund as per institution norms.",
    "location": "Hyderabad, India",
    "salary_range": "",
    "employment_type": "Full-time",
}

FRAUD_FIELDS = {
    "title": "",
    "company_profile": "",
    "description": ("URGENT FACULTY REQUIREMENT!!! Salary: Rs 2,00,000 per month. "
                     "No experience required. Registration Fee: Rs 500. "
                     "Contact through WhatsApp only."),
    "requirements": "",
    "benefits": "",
    "location": "",
    "salary_range": "",
    "employment_type": "",
}


def test_registration_fee_detected_only_when_mentioned():
    assert detect_registration_fee_requested(FRAUD_FIELDS) is True
    assert detect_registration_fee_requested(LEGIT_FIELDS) is False


def test_email_domain_extraction():
    fields = {"description": "Contact us at careers@kmit.in for more info."}
    assert extract_email_domain(fields) == "kmit.in"


def test_personal_email_domain_detection():
    official = {"description": "Email careers@kmit.in"}
    personal = {"description": "Email hr.jobs123@gmail.com"}
    assert detect_personal_email_domain(official) is False
    assert detect_personal_email_domain(personal) is True


def test_missing_company_profile():
    assert detect_missing_company_profile(LEGIT_FIELDS) is False
    assert detect_missing_company_profile(FRAUD_FIELDS) is True


def test_missing_company_website():
    assert detect_missing_company_website(LEGIT_FIELDS) is False
    assert detect_missing_company_website(FRAUD_FIELDS) is True


def test_unrealistic_salary_requires_monthly_high_figure_and_no_experience():
    assert detect_unrealistic_salary(FRAUD_FIELDS) is True
    assert detect_unrealistic_salary(LEGIT_FIELDS) is False


def test_whatsapp_only_contact():
    assert detect_whatsapp_only_contact(FRAUD_FIELDS) is True
    assert detect_whatsapp_only_contact(LEGIT_FIELDS) is False


def test_missing_location():
    assert detect_missing_location(LEGIT_FIELDS) is False
    assert detect_missing_location(FRAUD_FIELDS) is True


def test_urgent_wording_detected_via_keyword():
    assert detect_urgent_or_spam_wording(FRAUD_FIELDS) is True
    assert detect_urgent_or_spam_wording(LEGIT_FIELDS) is False


def test_unverified_website_or_email():
    assert detect_unverified_website_or_email(FRAUD_FIELDS) is True
    assert detect_unverified_website_or_email(LEGIT_FIELDS) is False


def test_poor_grammar_or_spam_wording_not_falsely_triggered_on_clean_text():
    assert detect_poor_grammar_or_spam_wording(LEGIT_FIELDS) is False


def test_detect_all_signals_returns_every_key():
    signals = detect_all_signals(FRAUD_FIELDS)
    expected_keys = {
        "registration_fee_requested", "personal_email_domain", "missing_company_profile",
        "missing_company_website", "unrealistic_salary", "whatsapp_only_contact",
        "missing_location", "poor_grammar_or_spam_wording", "urgent_or_spam_wording",
        "unverified_website_or_email",
    }
    assert set(signals.keys()) == expected_keys
