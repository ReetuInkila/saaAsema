#include <Arduino.h>
#include <unity.h>

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

void simple_test(void)
{
    TEST_ASSERT_EQUAL(33, 33);
}

void setup()
{
    delay(2000);

    UNITY_BEGIN();
    RUN_TEST(simple_test);
    UNITY_END();
}

void loop()
{
    delay(1000);
}