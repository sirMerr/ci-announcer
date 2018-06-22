export const mockErrorLog = ` FAIL  ./fail.test.js
  ✕ mistakes 1 + 2 to equal 4 (13ms)

  ● mistakes 1 + 2 to equal 4

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 3

      1 | test('mistakes 1 + 2 to equal 4', () => {
    > 2 | 	expect(1 + 2).toBe(4);
        | 	              ^
      3 | });
      4 |

      at Object.<anonymous>.test (fail.test.js:2:16)`;
