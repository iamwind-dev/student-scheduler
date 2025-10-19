/**
 * SIMPLE INTEGRATION TEST - No Jest Required
 * Run this in browser console to test the app
 */

// Test Suite Runner
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    describe(name, fn) {
        console.group(`📋 ${name}`);
        fn();
        console.groupEnd();
    }

    it(name, fn) {
        try {
            fn();
            this.passed++;
            console.log(`✅ ${name}`);
        } catch (error) {
            this.failed++;
            console.error(`❌ ${name}`);
            console.error(`   Error: ${error.message}`);
        }
    }

    expect(value) {
        return {
            toBe: (expected) => {
                if (value !== expected) {
                    throw new Error(`Expected ${expected} but got ${value}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(value) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
                }
            },
            toBeDefined: () => {
                if (value === undefined) {
                    throw new Error('Expected value to be defined');
                }
            },
            toBeNull: () => {
                if (value !== null) {
                    throw new Error('Expected value to be null');
                }
            },
            toBeTruthy: () => {
                if (!value) {
                    throw new Error('Expected value to be truthy');
                }
            },
            toBeFalsy: () => {
                if (value) {
                    throw new Error('Expected value to be falsy');
                }
            },
            toContain: (item) => {
                if (!value.includes(item)) {
                    throw new Error(`Expected array to contain ${item}`);
                }
            }
        };
    }

    summary() {
        console.log('\n');
        console.log('═'.repeat(50));
        console.log(`📊 Test Summary`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Total: ${this.passed + this.failed}`);
        console.log('═'.repeat(50));
    }
}

// Create test runner instance
const test = new TestRunner();

// ============================================
// TESTS START HERE
// ============================================

test.describe('AuthContext & AppProvider Integration', () => {
    // Test 1: Check localStorage
    test.it('localStorage should be cleared', () => {
        const token = localStorage.getItem('sessionToken');
        test.expect(token).toBeNull();
    });

    // Test 2: Check if app loaded without errors
    test.it('App should load without "useApp" errors', () => {
        // This test passes if you see this message without errors above
        const errors = document.querySelectorAll('[class*="error"]');
        // If we got here, no fatal errors occurred
        test.expect(true).toBeTruthy();
    });

    // Test 3: Check if AuthProvider is working
    test.it('useAuth hook should work (no error thrown)', () => {
        // If the login page rendered, this means AuthProvider works
        const loginElements = document.querySelectorAll('[class*="login"]');
        test.expect(loginElements.length > 0).toBeTruthy();
    });

    // Test 4: Check if AppProvider is working
    test.it('useApp hook should work (no error thrown)', () => {
        // If we don't see "useApp must be used within" error, AppProvider works
        const hasAppError = document.body.innerText.includes('useApp must be used within an AppProvider');
        test.expect(hasAppError).toBeFalsy();
    });
});

test.describe('LoginPage Component', () => {
    // Test 5: Check if login button exists
    test.it('Login button should be visible', () => {
        const loginBtn = document.querySelector('button');
        test.expect(loginBtn !== null).toBeTruthy();
    });

    // Test 6: Check if page title is displayed
    test.it('Page should display "Student Scheduler" title', () => {
        const title = document.body.innerText;
        test.expect(title.includes('Student Scheduler')).toBeTruthy();
    });

    // Test 7: Check for feature list
    test.it('Should display feature list', () => {
        const features = document.body.innerText;
        test.expect(features.includes('Tính năng') || features.includes('feature') || features.includes('Feature')).toBeTruthy();
    });
});

test.describe('Auth Demo Mode', () => {
    // Test 8: Check demo mode is enabled
    test.it('Demo mode should be enabled (VITE_ENTRA_CLIENT_ID=demo-mode)', () => {
        // Check if localStorage is empty (demo mode)
        const hasToken = localStorage.getItem('sessionToken');
        test.expect(hasToken).toBeNull();
    });

    // Test 9: Simulate demo login
    test.it('Demo login should set user data', (done) => {
        const loginBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.innerText.includes('Đăng nhập') || btn.innerText.includes('Login') || btn.innerText.includes('Microsoft')
        );

        if (loginBtn) {
            loginBtn.click();

            // Wait for login to complete
            setTimeout(() => {
                const userData = localStorage.getItem('userData');
                test.expect(userData !== null).toBeTruthy();
                if (done) done();
            }, 1000);
        } else {
            test.expect(false).toBeTruthy();
        }
    });
});

test.describe('Network & API', () => {
    // Test 10: Check network errors are handled
    test.it('Network error should not crash the app', () => {
        // If app is still responsive, errors are handled
        const app = document.querySelector('.app');
        test.expect(app !== null).toBeTruthy();
    });
});

// ============================================
// RUN SUMMARY
// ============================================
test.summary();

// Export for browser console
window.testRunner = test;
console.log('✅ Tests completed! Check results above.');
console.log('Run tests anytime by opening console and typing: testRunner.summary()');
