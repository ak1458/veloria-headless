import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Store emails in memory for now (replace with database later)
const subscribers = new Set<string>();

/**
 * POST /api/newsletter
 * Subscribe an email to the newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email
    const validated = subscribeSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase().trim();
    
    // Check if already subscribed
    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { success: true, message: "You're already subscribed!" },
        { status: 200 }
      );
    }
    
    // Add to subscribers
    subscribers.add(normalizedEmail);
    
    // TODO: Integrate with your email service (Mailchimp, ConvertKit, etc.)
    // Example for Mailchimp:
    // await addToMailchimp(normalizedEmail);
    
    console.log(`[Newsletter] New subscriber: ${normalizedEmail}`);
    console.log(`[Newsletter] Total subscribers: ${subscribers.size}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for subscribing! You'll receive exclusive offers and updates." 
      },
      { status: 200 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/count
 * Get subscriber count (for admin purposes)
 */
export async function GET(request: NextRequest) {
  // Simple auth check - you should implement proper admin auth
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.NEWSLETTER_ADMIN_KEY}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    count: subscribers.size,
    subscribers: Array.from(subscribers),
  });
}
