export default function FloatingTechBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] md:opacity-[0.40] z-0 overflow-hidden text-slate-300 transition-opacity duration-500 select-none">
            <svg 
                className="w-full h-full" 
                viewBox="0 0 1200 800" 
                preserveAspectRatio="xMidYMid slice" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 1. GRUP: Süreç ve Model Eğitimi */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 250,0; -150,0; 0,0" dur="29s" repeatCount="indefinite" />
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,120; 0,-80; 0,0" dur="19s" repeatCount="indefinite" />
                        <text x="80" y="120" className="translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="18">
                            <tspan fill="#2563eb">&lt;Process </tspan>
                            <tspan fill="#64748b">id=</tspan>
                            <tspan fill="#059669">"erp_flow_01"</tspan>
                            <tspan fill="#2563eb">&gt;</tspan>
                        </text>
                        <text x="800" y="150" className="-translate-x-[250px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                            <tspan fill="#9333ea">def </tspan>
                            <tspan fill="#2563eb">train_model</tspan>
                            <tspan fill="#64748b">(dataset):</tspan>
                        </text>
                        <g className="translate-x-[150px] md:translate-x-0 transition-transform duration-700">
                            <circle cx="500" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                            <circle cx="500" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,4" />
                            <polyline points="500,85 500,100 510,100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </g>
                </g>

                {/* 2. GRUP: SQL Sorgusu ve Şekiller */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; -180,0; 150,0; 0,0" dur="23s" repeatCount="indefinite" />
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-100; 0,130; 0,0" dur="17s" repeatCount="indefinite" />
                        <g className="translate-x-[200px] md:translate-x-0 transition-transform duration-700">
                            <rect x="250" y="250" width="120" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
                            <line x1="270" y1="270" x2="330" y2="270" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="270" y1="285" x2="350" y2="285" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="150" cy="280" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                        </g>
                        <g className="-translate-x-[200px] md:translate-x-0 transition-transform duration-700">
                            <polygon points="650,220 700,270 650,320 600,270" fill="none" stroke="currentColor" strokeWidth="3" />
                            <line x1="650" y1="245" x2="650" y2="295" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            <line x1="625" y1="270" x2="675" y2="270" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        <text x="750" y="380" className="-translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                            <tspan fill="#9333ea">SELECT </tspan>
                            <tspan fill="#64748b">strategy </tspan>
                            <tspan fill="#9333ea">FROM </tspan>
                            <tspan fill="#64748b">future;</tspan>
                        </text>
                    </g>
                </g>

                {/* 3. GRUP: JS, JSON ve Modüller */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 160,0; -220,0; 0,0" dur="31s" repeatCount="indefinite" />
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-80; 0,90; 0,0" dur="23s" repeatCount="indefinite" />
                        <text x="60" y="450" className="translate-x-[150px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="15">
                            <tspan fill="#9333ea">import </tspan>
                            <tspan fill="#64748b">{'{'} Model {'}'} </tspan>
                            <tspan fill="#9333ea">from </tspan>
                            <tspan fill="#059669">'ai-engine'</tspan>
                            <tspan fill="#64748b">;</tspan>
                        </text>
                        <text x="120" y="650" className="translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="18">
                            <tspan fill="#9333ea">const </tspan>
                            <tspan fill="#64748b">optimize = (data) </tspan>
                            <tspan fill="#2563eb">=&gt; </tspan>
                            <tspan fill="#64748b">data.</tspan>
                            <tspan fill="#2563eb">map</tspan>
                            <tspan fill="#64748b">(analyze);</tspan>
                        </text>
                        <text x="750" y="600" className="-translate-x-[250px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                            <tspan fill="#9333ea">await </tspan>
                            <tspan fill="#64748b">system.</tspan>
                            <tspan fill="#2563eb">automate</tspan>
                            <tspan fill="#64748b">();</tspan>
                        </text>
                        <text x="700" y="750" className="-translate-x-[150px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="15">
                            <tspan fill="#64748b">{'{'} </tspan>
                            <tspan fill="#059669">"status"</tspan>
                            <tspan fill="#64748b">: </tspan>
                            <tspan fill="#d97706">200</tspan>
                            <tspan fill="#64748b">, </tspan>
                            <tspan fill="#059669">"role"</tspan>
                            <tspan fill="#64748b">: </tspan>
                            <tspan fill="#059669">"admin"</tspan>
                            <tspan fill="#64748b"> {'}'}</tspan>
                        </text>
                        <g className="translate-x-[100px] md:translate-x-0 transition-transform duration-700">
                            <path d="M 850 450 L 910 450 L 910 520 C 895 535 865 505 850 520 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                            <line x1="865" y1="470" x2="895" y2="470" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="865" y1="490" x2="885" y2="490" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </g>
                    </g>
                </g>
            </svg>

            {/* İçeriklerin keskin bir çizgiyle değil, arka plan rengine (slate-50) yumuşakça karışarak kaybolmasını sağlayan katman */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50 pointer-events-none"></div>
        </div>
    )
}