'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { MiniCart } from './MiniCart';

// Detect Safari (desktop & iOS)
const isSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    ua.includes('Safari') &&
    !ua.includes('Chrome') &&
    !ua.includes('Chromium') &&
    !ua.includes('Edg')
  );
};

const CartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M7 18c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm10 0c-.552 
      0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zM4 4h1.25c.322 0 .602.204.707.51L7.8 
      11h9.9c.46 0 .8.435.707.885l-1 5A.75.75 0 0 1 16.67 18H8.33a.75.75 0 0 1-.737-.615L6.03 
      5.5H4a.75.75 0 0 1 0-1.5z"
      fill="currentColor"
    />
  </svg>
);

const MicIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className,
  active,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.07A7 7 0 0 1 5 11a1 1 0 0 1 2 0 5 5 0 0 0 10 0z"
      fill={active ? '#db2777' : 'currentColor'}
    />
  </svg>
);

type VoiceMode = 'webspeech' | 'server' | 'none';

export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const miniCartRef = useRef<HTMLDivElement | null>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('none');
  const recognitionRef = useRef<any | null>(null);

  // For server mode (MediaRecorder)
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinkClass = (href: string) =>
    `block px-3 py-1.5 text-sm font-medium rounded-full transition ${
      pathname === href
        ? 'bg-pink-500 text-white shadow-sm'
        : 'text-gray-700 hover:bg-white/70 hover:text-pink-600'
    }`;

  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  const toggleMiniCart = () => setMiniCartOpen(prev => !prev);
  const closeMiniCart = () => setMiniCartOpen(false);

  const handleViewCartFromMiniCart = () => {
    setMiniCartOpen(false);
    router.push('/cart');
  };

  const handleCheckoutFromMiniCart = () => {
    setMiniCartOpen(false);
    router.push('/checkout');
  };

  // ---------- Voice-command helpers ----------

  const handleScrollCommand = (direction: 'down' | 'up') => {
    if (typeof window === 'undefined') return;
    const delta = window.innerHeight * 0.8;
    window.scrollBy({
      top: direction === 'down' ? delta : -delta,
      behavior: 'smooth',
    });
  };

  const handleAddByIndex = (index: number) => {
    if (typeof document === 'undefined') return;
    if (!index || index < 1) return;

    const button = document.querySelector(
      `[data-product-index="${index}"] [data-role="add-to-cart"]`
    ) as HTMLButtonElement | null;

    if (button) button.click();
  };

  const handleOpenDetailsByIndex = (index: number) => {
  if (typeof document === 'undefined') return;
  if (!index || index < 1) return;

  const link = document.querySelector(
    `[data-product-index="${index}"] [data-role="open-details"]`
  ) as HTMLAnchorElement | HTMLButtonElement | null;

  if (link) link.click();
};


  const clickCartButton = (index: number, role: string) => {
    if (typeof document === 'undefined') return;
    const row = document.querySelector(
      `[data-cart-index="${index}"]`
    ) as HTMLElement | null;
    if (!row) return;

    const btn = row.querySelector(
      `[data-role="${role}"]`
    ) as HTMLButtonElement | null;
    if (btn) btn.click();
  };

  const setCartQuantity = (index: number, qty: number) => {
    if (typeof document === 'undefined') return;
    const row = document.querySelector(
      `[data-cart-index="${index}"]`
    ) as HTMLElement | null;
    if (!row) return;

    const input = row.querySelector(
      '[data-role="cart-qty-input"]'
    ) as HTMLInputElement | null;
    if (!input) return;

    input.value = String(qty);
    const ev = new Event('change', { bubbles: true });
    input.dispatchEvent(ev);
  };

  const applyNaturalFilter = (transcript: string) => {
    const lower = transcript.toLowerCase();

    const colors = [
      'red',
      'blue',
      'black',
      'white',
      'green',
      'pink',
      'yellow',
      'beige',
      'brown',
      'purple',
    ];
    const categories: { key: string; value: string }[] = [
      { key: 'dress', value: 'dresses' },
      { key: 'dresses', value: 'dresses' },
      { key: 'top', value: 'tops' },
      { key: 'tops', value: 'tops' },
      { key: 'saree', value: 'sarees' },
      { key: 'kurta', value: 'kurtas' },
      { key: 'gown', value: 'gowns' },
    ];

    const colorMatch = colors.find(c => lower.includes(c));
    const categoryMatch = categories.find(c => lower.includes(c.key));

    let maxPrice: number | undefined;
    const priceMatch = lower.match(
      /(under|below|less than)\s+(\d+(\.\d+)?)/
    );
    if (priceMatch) {
      maxPrice = parseFloat(priceMatch[2]);
    }

    if (!colorMatch && !categoryMatch && maxPrice === undefined) return;

    const params = new URLSearchParams();
    if (colorMatch) params.set('color', colorMatch);
    if (categoryMatch) params.set('category', categoryMatch.value);
    if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice));

    const search = params.toString();
    router.push(`/shop${search ? `?${search}` : ''}`);
  };

  const handleTranscript = (raw: string) => {
    const transcript = raw.toLowerCase().trim();

    // ----- Scroll -----
    if (
      transcript.includes('scroll down') ||
      transcript.includes('next page') ||
      transcript.includes('next product') ||
      transcript.includes('scroll next')
    ) {
      handleScrollCommand('down');
      return;
    }

    if (
      transcript.includes('scroll up') ||
      transcript.includes('previous page') ||
      transcript.includes('prev page') ||
      transcript.includes('previous product') ||
      transcript.includes('scroll previous')
    ) {
      handleScrollCommand('up');
      return;
    }

    const numbers = transcript.match(/\d+/g);

    // ----- Cart modification commands -----
    if (
      transcript.includes('increase item') ||
      (transcript.includes('item') && transcript.includes('plus'))
    ) {
      if (numbers && numbers.length >= 1) {
        const index = parseInt(numbers[0], 10);
        if (!Number.isNaN(index)) {
          clickCartButton(index, 'cart-increase');
          return;
        }
      }
    }

    if (
      transcript.includes('decrease item') ||
      (transcript.includes('item') && transcript.includes('minus'))
    ) {
      if (numbers && numbers.length >= 1) {
        const index = parseInt(numbers[0], 10);
        if (!Number.isNaN(index)) {
          clickCartButton(index, 'cart-decrease');
          return;
        }
      }
    }

    if (
      transcript.includes('remove item') ||
      transcript.includes('delete item') ||
      transcript.includes('remove this item')
    ) {
      if (numbers && numbers.length >= 1) {
        const index = parseInt(numbers[0], 10);
        if (!Number.isNaN(index)) {
          clickCartButton(index, 'cart-remove');
          return;
        }
      }
    }

    if (
      transcript.includes('set item') ||
      transcript.includes('change item') ||
      transcript.includes('make item')
    ) {
      if (numbers && numbers.length >= 2) {
        const index = parseInt(numbers[0], 10);
        const qty = parseInt(numbers[1], 10);
        if (!Number.isNaN(index) && !Number.isNaN(qty)) {
          setCartQuantity(index, qty);
          return;
        }
      }
    }

    // ----- Open product details by number -----
// Examples: "open number 3", "open product 2", "view 5"
if (
  transcript.includes('open') ||
  transcript.includes('view') ||
  transcript.includes('details')
) {
  const nums = transcript.match(/\d+/g);
  if (nums && nums.length >= 1) {
    const index = parseInt(nums[0], 10);
    if (!Number.isNaN(index)) {
      handleOpenDetailsByIndex(index);
      return;
    }
  }
}


    // ----- Product add by number -----
    if (transcript.includes('add')) {
      if (numbers && numbers.length >= 1) {
        const index = parseInt(numbers[0], 10);
        if (!Number.isNaN(index)) {
          handleAddByIndex(index);
          return;
        }
      }
    }

    // ----- Natural-language filters -----
    applyNaturalFilter(transcript);
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  // Decide voice mode based on browser capabilities
  useEffect(() => {
  if (typeof window === 'undefined') return;

  // 👉 If Safari, bail out: no voice
  if (isSafari()) {
    setVoiceMode('none');
    return;
  }

  const w = window as any;
  const hasWebSpeech =
    !!w.SpeechRecognition || !!w.webkitSpeechRecognition;
  const hasMediaRecorder = typeof w.MediaRecorder !== 'undefined';
  const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;

  if (hasWebSpeech) {
    // Chrome / Edge
    setVoiceMode('webspeech');
  } else if (hasMediaRecorder && hasGetUserMedia) {
    // Non-Safari browsers that support MediaRecorder
    setVoiceMode('server');
  } else {
    setVoiceMode('none');
  }
}, []);


  // Web Speech mode
  useEffect(() => {
    if (voiceMode !== 'webspeech') return;
    if (typeof window === 'undefined') return;

    if (isListening) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        handleTranscript(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, voiceMode]);

  // Server STT mode (MediaRecorder + Whisper)
  useEffect(() => {
    if (voiceMode !== 'server') return;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = e => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          audioChunksRef.current = [];

          const formData = new FormData();
          formData.append('audio', blob, 'voice.webm');

          try {
            const res = await fetch('/api/voice-command', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.transcript) {
              handleTranscript(data.transcript);
            }
          } catch (err) {
            console.error('Failed to send audio', err);
          }

          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
          }
        };

        recorder.start();
      } catch (err) {
        console.error('getUserMedia error', err);
        setIsListening(false);
      }
    };

    if (isListening) {
      startRecording();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      mediaStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, voiceMode]);

  // Close mini cart on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        miniCartRef.current &&
        !miniCartRef.current.contains(e.target as Node)
      ) {
        setMiniCartOpen(false);
      }
    }
    if (miniCartOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [miniCartOpen]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-pink-50/60 border-b border-white/60">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LEFT SIDE: Title + microphone (always visible on mobile & desktop) */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-pink-700"
            onClick={() => {
              closeMobile();
              closeMiniCart();
            }}
          >
            Glam By Leena's Boutique
          </Link>

          {voiceMode !== 'none' && (
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full border text-xs ${
                isListening
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-pink-50 hover:border-pink-300'
              }`}
              aria-pressed={isListening}
              aria-label={
                isListening
                  ? 'Stop voice commands'
                  : 'Talk to shop - say things like add number 3 or scroll down'
              }
              title="Talk to shop"
            >
              <MicIcon className="h-4 w-4" active={isListening} />
            </button>
          )}

          {voiceMode === 'none' && (
            <span className="hidden sm:inline text-[10px] text-gray-500">
              Voice works best in Chrome/Edge.
            </span>
          )}

          
        </div>

        {/* RIGHT SIDE: Desktop nav + cart */}
        <div
          className="hidden md:flex items-center gap-2"
          aria-label="Main navigation"
        >
          <Link
            href="/collections/latest"
            className={navLinkClass('/collections/latest')}
          >
            Latest
          </Link>
          <Link
            href="/collections/hot"
            className={navLinkClass('/collections/hot')}
          >
            Hot
          </Link>
          <Link href="/shop" className={navLinkClass('/shop')}>
            Shop
          </Link>
          <Link href="/about" className={navLinkClass('/about')}>
            About
          </Link>
          <Link href="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>
          <Link href="/feedback" className={navLinkClass('/feedback')}>
            Feedback
          </Link>
          <Link href="/admin/products" className={navLinkClass('/admin/products')}>
            Admin
          </Link>

          {/* Cart icon + mini cart (desktop) */}
          <div className="relative ml-2" ref={miniCartRef}>
            <button
              type="button"
              onClick={toggleMiniCart}
              className="relative inline-flex items-center justify-center"
              aria-label="Cart"
              aria-haspopup="dialog"
              aria-expanded={miniCartOpen}
            >
              <CartIcon className="h-6 w-6 text-pink-700 hover:text-pink-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 h-5 min-w-[1.25rem] bg-pink-600 text-white text-[10px] font-semibold flex items-center justify-center rounded-full px-1">
                  {itemCount}
                </span>
              )}
            </button>
            {miniCartOpen && (
  <MiniCart
    onClose={closeMiniCart}
    onViewCart={handleViewCartFromMiniCart}
    onCheckout={handleCheckoutFromMiniCart}
  />
)}

          </div>
        </div>

        {/* MOBILE: cart + hamburger on right */}
<div className="flex items-center gap-3 md:hidden">
  {/* Cart icon (mobile) – now opens MiniCart instead of /cart */}
  <div className="relative" ref={miniCartRef}>
    <button
      type="button"
      onClick={() => {
        // don’t close mobile nav automatically, just toggle miniCart
        toggleMiniCart();
      }}
      className="relative inline-flex items-center justify-center"
      aria-label="Cart"
      aria-haspopup="dialog"
      aria-expanded={miniCartOpen}
    >
      <CartIcon className="h-6 w-6 text-pink-700 hover:text-pink-600" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-2 h-5 min-w-[1.25rem] bg-pink-600 text-white text-[10px] font-semibold flex items-center justify-center rounded-full px-1">
          {itemCount}
        </span>
      )}
    </button>
    {miniCartOpen && (
  <MiniCart
    onClose={closeMiniCart}
    onViewCart={handleViewCartFromMiniCart}
    onCheckout={handleCheckoutFromMiniCart}
  />
)}

  </div>

  {/* Hamburger menu stays the same */}
  <button
    type="button"
    onClick={toggleMobile}
    className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-md border border-pink-300 text-pink-700 hover:bg-pink-100 transition group"
    aria-label="Toggle navigation menu"
    aria-expanded={mobileOpen}
  >
    <div className="space-y-1.5">
      <span className="block h-[3px] w-6 bg-pink-700 rounded"></span>
      <span className="block h-[3px] w-6 bg-pink-700 rounded"></span>
      <span className="block h-[3px] w-6 bg-pink-700 rounded"></span>
    </div>
    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
      Open Menu
    </span>
  </button>
</div>

      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/70 bg-pink-50/95 backdrop-blur">
          <div
            className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2"
            aria-label="Mobile navigation"
          >
            <Link
              href="/collections/latest"
              className={navLinkClass('/collections/latest')}
              onClick={closeMobile}
            >
              Latest
            </Link>
            <Link
              href="/collections/hot"
              className={navLinkClass('/collections/hot')}
              onClick={closeMobile}
            >
              Hot
            </Link>
            <Link
              href="/shop"
              className={navLinkClass('/shop')}
              onClick={closeMobile}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={navLinkClass('/about')}
              onClick={closeMobile}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={navLinkClass('/contact')}
              onClick={closeMobile}
            >
              Contact
            </Link>
            <Link
              href="/feedback"
              className={navLinkClass('/feedback')}
              onClick={closeMobile}
            >
              Feedback
            </Link>
            <Link
              href="/admin/products"
              className={navLinkClass('/admin/products')}
              onClick={closeMobile}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
