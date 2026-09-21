import { CheckCircle2, AlertTriangle, AlertCircle, Search } from 'lucide-react';
import type { CompanyVerification } from '@/types';

interface AuditItemProps {
  status: 'passed' | 'failed' | 'warning';
  title: string;
  description: string;
}

function AuditItem({ status, title, description }: AuditItemProps) {
  let Icon = CheckCircle2;
  let colorClass = 'text-emerald-700 bg-emerald-50/50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30';
  
  if (status === 'failed') {
    Icon = AlertCircle;
    colorClass = 'text-rose-700 bg-rose-50/50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30';
  } else if (status === 'warning') {
    Icon = AlertTriangle;
    colorClass = 'text-amber-700 bg-amber-50/50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30';
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${colorClass}`}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      <div>
        <h5 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{title}</h5>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface CompanyDetails {
  companyName: string;
  domain: string | null;
  email: string | null;
  emailDomain: string | null;
  isEmailPersonal: boolean;
  isDomainMatch: boolean;
}

function extractCompanyDetails(text: string): CompanyDetails {
  // 1. Extract email
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : null;
  const emailDomain = emailMatch ? emailMatch[2].toLowerCase() : null;
  
  // List of common free domains
  const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'mail.com', 'zoho.com', 'protonmail.com', 'yandex.com', 'gmx.com'];
  const isEmailPersonal = emailDomain ? freeDomains.includes(emailDomain) : false;
  
  // 2. Extract website/domain
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;
  let domain: string | null = null;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const d = match[1].toLowerCase();
    // Exclude general domains & personal email domains
    if (!freeDomains.includes(d) && d !== 'linkedin.com' && d !== 'naukri.com' && d !== 'google.com' && d !== 'yahoo.com') {
      domain = d;
      break;
    }
  }
  
  // If no custom domain found, but custom email domain exists, use that as website domain
  if (!domain && emailDomain && !isEmailPersonal) {
    domain = emailDomain;
  }
  
  // 3. Determine Company Name
  let companyName = '';
  
  // Look for "Company: Name" or "at Name" or similar patterns in text first
  const companyPatterns = [
    /(?:company|employer|organization)\s*:\s*([a-zA-Z0-9\s.\-]{3,30})/i,
    /(?:hiring|recruit|work)\s+at\s+([a-zA-Z0-9\s.\-]{3,30})/i,
    /looking\s+for\s+.*\s+at\s+([a-zA-Z0-9\s.\-]{3,30})/i
  ];
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      companyName = match[1].trim();
      break;
    }
  }

  // If no patterns match, fall back to domain name
  if (!companyName && domain) {
    const parts = domain.split('.');
    companyName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  
  if (!companyName) {
    companyName = 'Unknown Company';
  }
  
  // 4. Check domain match (does email domain match the website domain?)
  let isDomainMatch = true;
  if (emailDomain && domain && !isEmailPersonal) {
    isDomainMatch = emailDomain === domain;
  } else if (emailDomain && isEmailPersonal) {
    isDomainMatch = false;
  }
  
  return {
    companyName,
    domain,
    email,
    emailDomain,
    isEmailPersonal,
    isDomainMatch
  };
}

export function AutomatedAuditCard({ 
  flags, 
  extractedText, 
  companyVerification 
}: { 
  flags: string[]; 
  extractedText: string; 
  companyVerification?: CompanyVerification | null;
}) {
  const details = extractCompanyDetails(extractedText);
  const { email, emailDomain, isEmailPersonal, isDomainMatch } = details;

  // Use live company verification details if searched successfully
  const companyName = companyVerification?.companyName || details.companyName;
  
  let domain = details.domain;
  if (companyVerification?.officialWebsite) {
    try {
      const parsedUrl = new URL(companyVerification.officialWebsite);
      domain = parsedUrl.hostname.toLowerCase().replace('www.', '');
    } catch {
      // Fallback
    }
  }

  const linkedinPage = companyVerification?.linkedinPage || 
    (companyName !== 'Unknown Company' 
      ? `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` 
      : null);

  const hasFee = flags.includes('registration_fee_requested');
  const hasUnrealisticSalary = flags.includes('unrealistic_salary');
  const hasNoProfile = flags.includes('missing_company_profile');
  const hasWhatsappOnly = flags.includes('whatsapp_only_contact');
  const hasUrgency = flags.includes('urgent_or_spam_wording');
  const hasUnverifiedContact = flags.includes('unverified_website_or_email');

  // Define Authority Info based on details
  let authorityTitle = 'Unknown Authority';
  let authorityBadgeClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800';
  let authorityText = 'No company website or email domain was found in the text to verify the issuer.';

  if (email && isEmailPersonal) {
    authorityTitle = 'Unverified Sender (Personal Email)';
    authorityBadgeClass = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    authorityText = `The contact email (${email}) uses a personal domain (${emailDomain}). Official company communications are conducted via registered corporate domains. Apply with caution.`;
  } else if (domain && email && !isEmailPersonal) {
    if (isDomainMatch) {
      authorityTitle = 'Verified Direct Issuer';
      authorityBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      authorityText = `The recruiter's email domain (${emailDomain}) matches the company's official domain (${domain}). This listing is verified as issued directly by the hiring company.`;
    } else {
      authorityTitle = 'Third-Party / Affiliate Recruiter';
      authorityBadgeClass = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      authorityText = `The recruiter's email domain (${emailDomain}) is different from the company's website domain (${domain}). This suggests a third-party recruiter or recruitment agency.`;
    }
  } else if (domain && !email) {
    authorityTitle = 'Verified Employer (Public Posting)';
    authorityBadgeClass = 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-900/30';
    authorityText = `This listing was published by ${companyName} on a public board without attaching a direct contact email. Our engine verified the corporate identity of ${companyName} (${domain}) and generated direct search links to verify their HR team on LinkedIn.`;
  } else if (!domain && email && !isEmailPersonal) {
    authorityTitle = 'Corporate Recruiter Email';
    authorityBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    authorityText = `Recruiter's contact email (${email}) uses a registered corporate domain (${emailDomain}), but no company website link was found in the posting.`;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm card-3d-hover dark:border-slate-800 dark:bg-slate-900">
      {/* Company Verification Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
        <img 
          src={domain ? `https://logo.clearbit.com/${domain}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0ea5e9&color=fff&bold=true`} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0ea5e9&color=fff&bold=true`;
          }}
          className="h-12 w-12 rounded-xl border border-slate-100 dark:border-slate-800 object-contain p-1 bg-white"
          alt={companyName}
        />
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">{companyName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {domain ? `Domain verified: ${domain}` : 'No verified domain found'}
          </p>
        </div>
      </div>

      {/* Comparative Assets Table */}
      <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/20">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Hiring Authority & Comparative Assets
        </h4>
        
        {/* Authority Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold mb-2.5 ${authorityBadgeClass}`}>
          {authorityTitle}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {authorityText}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Official Company Assets */}
          <div className="rounded-lg border border-slate-150 bg-white p-3 dark:border-slate-800/80 dark:bg-slate-900">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Official Company Profile
            </span>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Name:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Website:</span>
                {domain ? (
                  <a 
                    href={`https://${domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400 truncate max-w-[150px]"
                    title={domain}
                  >
                    {domain}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Not found</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">LinkedIn:</span>
                {linkedinPage ? (
                  <a 
                    href={linkedinPage}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Verify Page
                  </a>
                ) : (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Not found</span>
                )}
              </div>
            </div>
          </div>

          {/* Listing Recruiter & Hiring Person Assets */}
          <div className="rounded-lg border border-slate-150 bg-white p-3 dark:border-slate-800/80 dark:bg-slate-900">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recruiter / Sender Details
            </span>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Contact Person:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={companyVerification?.recruiterName || 'Company HR Team'}>
                  {companyVerification?.recruiterName || 'Company HR Team'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Email:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={email || 'Omitted in public post'}>
                  {email || 'Omitted in public post'}
                </span>
              </div>
              {companyVerification?.recruiterPhone && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Phone/WhatsApp:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {companyVerification.recruiterPhone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Domain:</span>
                <span className={`text-xs font-semibold ${isEmailPersonal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {emailDomain || domain || 'Verified Web Domain'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Authority:</span>
                <span className={`text-xs font-bold ${isEmailPersonal ? 'text-rose-600 dark:text-rose-400' : email || domain ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {companyVerification?.recruiterVerificationStatus || (isEmailPersonal ? 'Unverified (Free Email)' : domain ? 'Corporate Verified (Direct Employer)' : 'No Domain Found')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Summary Section */}
        {companyVerification?.summary && (
          <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Company Overview & History
            </span>
            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 rounded-lg">
              {companyVerification.summary}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Verification Checkpoints</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            Live Audit
          </span>
        </div>
      </div>
      
      <div className="grid gap-3.5">
        {/* Check 1: Registration Fee Check */}
        <AuditItem
          status={hasFee ? 'failed' : 'passed'}
          title="Candidate Fee Check"
          description={
            hasFee
              ? "❌ FAILURE: The text directly requests a registration fee, training deposit, or advance payment. Legitimate employers never charge candidates money to apply, train, or obtain equipment."
              : "✅ PASSED: No application fees, training charges, or security deposit requests were detected in the listing."
          }
        />

        {/* Check 2: Contact Information & Email Domain Check */}
        <AuditItem
          status={hasUnverifiedContact || (email && isEmailPersonal) ? 'failed' : !isDomainMatch ? 'warning' : 'passed'}
          title="Recruiter Communication Channels Audit"
          description={
            email && isEmailPersonal
              ? `❌ FAILURE: The listing uses a personal/free email address (${email}). Official recruitment should always be conducted via corporate domain names.`
              : hasUnverifiedContact
              ? "❌ FAILURE: No official company website or corporate email domain (like @company.com) was found. The posting only contains free personal email addresses or has completely missing contact info."
              : !isDomainMatch && email && domain
              ? `⚠️ WARNING: Domain mismatch. The recruiter email (${email}) uses a different domain than the company website (${domain}). Ensure these are affiliated before replying.`
              : hasWhatsappOnly
              ? "⚠️ WARNING: The posting lists a WhatsApp number as the only contact channel, without any official corporate email or company website. Official recruiters generally communicate via verified corporate domains."
              : email
              ? `✅ PASSED: Recruiter contact email (${email}) uses a verified corporate domain.`
              : "✅ PASSED: Verifiable official corporate contact channels (official email domain or company website) were detected."
          }
        />

        {/* Check 3: Salary & Experience Plausibility */}
        <AuditItem
          status={hasUnrealisticSalary ? 'failed' : 'passed'}
          title="Salary & Requirements Consistency Check"
          description={
            hasUnrealisticSalary
              ? "❌ FAILURE: The posting offers an extremely high salary combined with a 'no experience required' clause. This mismatch is a classic hallmark of employment scams designed to lure victims."
              : "✅ PASSED: Salary claims are consistent with typical entry-level requirements, or no extreme salary-to-experience promises were made."
          }
        />

        {/* Check 4: Company Background Verification */}
        <AuditItem
          status={hasNoProfile ? 'failed' : 'passed'}
          title="Company Background & Identity Check"
          description={
            hasNoProfile
              ? "❌ FAILURE: No company profile, history, or background details are provided. Legitimate listings usually introduce the hiring organization so candidates can research them independently."
              : "✅ PASSED: The listing provides details or a profile about the hiring company, allowing for baseline background verification."
          }
        />

        {/* Check 5: Urgency & High-Pressure Tactics Check */}
        <AuditItem
          status={hasUrgency ? 'warning' : 'passed'}
          title="Urgency & Pressure Tactics Audit"
          description={
            hasUrgency
              ? "⚠️ WARNING: High-pressure urgency keywords ('apply immediately', 'limited slots remaining') or excessive capitalization were detected. Scammers use artificial pressure to rush you into signing up."
              : "✅ PASSED: No high-pressure sales pitch or artificial urgency tactics were detected in the wording."
          }
        />
      </div>

      {/* Manual Verification Search Buttons */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h5 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Verify Listing & Hiring Manager Manually
        </h5>
        <div className="flex flex-wrap gap-2">
          {companyVerification?.recruiterName && (
            <a
              href={companyVerification.recruiterSearchUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyVerification.recruiterName + " " + companyName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/60 transition-colors"
            >
              <Search className="h-3 w-3" />
              Verify Recruiter ({companyVerification.recruiterName})
            </a>
          )}
          <a
            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(companyName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="h-3 w-3" />
            Search LinkedIn for "{companyName}"
          </a>
          <a
            href={`https://www.naukri.com/${encodeURIComponent(companyName.toLowerCase())}-jobs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="h-3 w-3" />
            Search Naukri for "{companyName}"
          </a>
        </div>
      </div>
    </div>
  );
}
